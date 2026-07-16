---
title: ⚙️ Windows RDP 계정과 SSH 계정은 따로가 아니다
tags:
  - ssh
  - rdp
  - windows
  - linux
  - 인증
date: 2026-06-09
---

## 개요
> SSH는 어느 OS에서도 자체 계정을 만들지 않고 OS 계정에 얹힌다. Windows에선 그 OS 계정을 RDP와 공유한다. 즉 RDP와 SSH는 "따로 관리되는 계정"이 아니라 **"같은 계정, 다른 출입문 + 다른 권한 게이트"**이다.

---

## 1. 전체 개념 / 흐름

### 1-1. 큰 그림

RDP와 SSH는 별도의 계정 저장소를 갖지 않는다. 둘 다 **하나의 OS 계정 저장소**로 들어가는 서로 다른 출입문이다. 각 출입문 앞에는 그 경로로 들어와도 되는지 판정하는 **게이트(출입 권한)**가 따로 있다.

```
        같은 계정 저장소, 다른 출입문 + 다른 권한 게이트

  RDP 클라이언트 ──► [ RDP 출입문 ] ──┐
                      게이트:           │
                      Remote Desktop    │
                      Users 그룹        ▼
                                   ┌────────────────────┐
                                   │   OS 계정 저장소    │ ──► 인증 성공/실패
                                   │  (계정 + 비밀번호)  │
                                   └────────────────────┘
                                        ▲
  SSH 클라이언트 ──► [ SSH 출입문 ] ──┘
                      게이트:
                      sshd AllowUsers
                      /DenyUsers (+PAM)
```

핵심: "계정 추가" = "OS 계정 추가"이고, 그 계정이 RDP·SSH **양쪽 후보**가 된다. SSH 전용 계정을 따로 만드는 것이 아니다.

### 1-2. 사전 지식 / 용어

본문 이해에 필요한 개념이다. 이미 알면 스킵하라.

- **OS 계정 저장소** — OS가 사용자 계정과 비밀번호를 보관하는 곳. Windows는 로컬 SAM 또는 AD 도메인, Linux는 `/etc/passwd` + `/etc/shadow`.
- **sshd** — SSH 접속을 받는 서버 데몬. **자체 계정/비밀번호 DB가 없다.** 인증을 OS 계정 저장소에 위임할 뿐이다.
- **PAM (Pluggable Authentication Modules)** — Linux의 인증 모듈 체계. Linux sshd는 인증 판정을 PAM에 위임한다.
- **게이트(출입 권한)** — 특정 계정이 특정 경로(RDP/SSH)로 들어올 수 있는지 결정하는 권한·정책. **계정의 존재 여부와 별개**다.
- **authorized_keys** — SSH 공개키 인증에 쓰는 사용자별 공개키 목록 파일.
- **MSA (Microsoft 계정)** — 이메일 기반 클라우드 계정. Windows 로그인 시 로컬 프로필에 매핑된다.

### 1-3. 비교 예시 / 익숙한 것과 대조

독자가 이미 아는 RDP를 기준으로 SSH를 대조하면 빠르게 잡힌다. 둘은 **같은 저장소를 쓰는 다른 출입문**이라는 점이 핵심이다.

| 항목 | RDP (익숙한 것) | SSH (대조 대상) |
|---|---|---|
| 계정 저장소 | OS 계정 저장소 | **같은** OS 계정 저장소 |
| 자체 계정 DB | 없음 | 없음 |
| 들어가는 경로(출입문) | 원격 데스크톱 | SSH |
| 출입 허용 게이트 | Remote Desktop Users 그룹 | sshd_config `AllowUsers` 등 |
| 인증 수단 | 계정 비밀번호 | 비밀번호 또는 공개키 |

> 같은 계정이라도 RDP는 되고 SSH는 안 될 수 있다. **계정이 달라서가 아니라 게이트가 다르기 때문**이다.

이어서 OS별 차이도 대조한다.

| 항목 | Windows | Linux |
|---|---|---|
| 계정 저장소 | 로컬 SAM / AD 도메인 | `/etc/passwd` + `/etc/shadow` (PAM) |
| SSH·RDP 공용 여부 | SSH·RDP가 **같은 저장소 공용** | RDP 개념 없음 (xrdp/VNC가 별도, 보통 같은 Linux 계정 사용) |
| 계정 추가 | `net user bob pw /add` | `useradd bob` + `passwd bob` |
| 키 인증 경로 | `%UserProfile%\.ssh\authorized_keys` | `~/.ssh/authorized_keys` |
| 관리자 키 인증 | `administrators_authorized_keys` (관리자 공용 파일) | 동일하게 `~/.ssh/authorized_keys` |

### 1-4. 구성요소 역할 — "따로 관리되는 것"은 계정이 아니라 게이트

따로 관리되는 것은 **계정이 아니라 출입 권한(게이트)**이다. 게이트별 위치와 역할은 다음과 같다.

| 게이트 | 위치 / 설정 | 역할 |
|---|---|---|
| Windows RDP 게이트 | **Remote Desktop Users** 그룹 + "원격 데스크톱 로그온 허용" 권한 | 계정이 RDP로 들어올 수 있는지 판정 |
| Windows SSH 게이트 | `sshd_config`의 `AllowUsers` / `DenyUsers` / `AllowGroups` / `DenyGroups` | 계정이 SSH로 들어올 수 있는지 판정 |
| Linux SSH 게이트 | `/etc/ssh/sshd_config` 동일 지시어 + PAM | 계정이 SSH로 들어올 수 있는지 판정 |

---

## 2. 전체 예시 코드

OS별로 "계정 추가(공용 저장소)"와 "SSH 게이트·키 설정"이 어떻게 분리되는지 전체 흐름을 먼저 본다.

```powershell
# ── Windows ────────────────────────────────────────────
# 1) OS 계정 추가 (RDP·SSH 공용 저장소에 등록됨)
net user bob P@ssw0rd /add

# 2) RDP 게이트 열기 (이 계정을 RDP로 허용)
net localgroup "Remote Desktop Users" bob /add

# 3) SSH 키 인증 경로 (일반 사용자)
#    C:\Users\bob\.ssh\authorized_keys 에 공개키 등록
#    관리자 계정은 공용 파일 사용:
#    C:\ProgramData\ssh\administrators_authorized_keys

# 4) SSH 게이트 (필요 시 sshd_config에서 허용 계정 제한)
#    C:\ProgramData\ssh\sshd_config
#    AllowUsers bob
```

```bash
# ── Linux ──────────────────────────────────────────────
# 1) OS 계정 추가 (/etc/passwd + /etc/shadow)
useradd bob
passwd bob

# 2) SSH 키 인증 경로
#    ~bob/.ssh/authorized_keys 에 공개키 등록

# 3) SSH 게이트 (/etc/ssh/sshd_config)
#    AllowUsers bob
#    AllowGroups ssh-users
#    (Linux엔 RDP 개념 없음 — xrdp/VNC는 별도 데몬이며 보통 같은 계정 사용)
```

---

## 3. 포인트별 상세 해설

### 3-1. 계정 추가 — "SSH 전용 계정"은 없다

```powershell
net user bob P@ssw0rd /add        # Windows
```
```bash
useradd bob && passwd bob         # Linux
```

| 항목 | 설명 |
|---|---|
| `net user … /add` | Windows OS 계정 저장소(SAM)에 계정 등록. 이 계정이 RDP·SSH **양쪽 후보**가 됨 |
| `useradd` / `passwd` | Linux `/etc/passwd`·`/etc/shadow`에 계정·비밀번호 등록 |

> **핵심**: 어느 명령도 "SSH 전용 계정"을 만들지 않는다. sshd엔 등록할 자체 DB가 없으므로, 만들 수 있는 것은 OS 계정뿐이다.

### 3-2. RDP 게이트 — 그룹 소속으로 출입 허용

```powershell
net localgroup "Remote Desktop Users" bob /add
```

- 계정 `bob`을 **Remote Desktop Users** 그룹에 넣어 RDP 출입문을 연다.
- 이 게이트를 열어도 SSH는 별개다. SSH 게이트(`sshd_config`)가 막혀 있으면 SSH는 여전히 불가하다.

### 3-3. SSH 게이트 — sshd_config 지시어

```
AllowUsers bob
DenyUsers  guest
AllowGroups ssh-users
DenyGroups  no-ssh
```

| 지시어 | 설명 |
|---|---|
| `AllowUsers` | 명시한 계정만 SSH 허용 (화이트리스트) |
| `DenyUsers` | 명시한 계정만 SSH 차단 (블랙리스트) |
| `AllowGroups` / `DenyGroups` | 그룹 단위로 SSH 허용/차단 |

- Windows·Linux 모두 `sshd_config`에서 동일한 지시어를 쓴다. Linux는 추가로 PAM 정책의 영향을 받는다.

### 3-4. 키 인증 경로 — 일반 계정 vs 관리자

| 위치 | 적용 대상 |
|---|---|
| `%UserProfile%\.ssh\authorized_keys` (Windows) / `~/.ssh/authorized_keys` (Linux) | 일반 사용자 계정별 |
| `C:\ProgramData\ssh\administrators_authorized_keys` (Windows) | 관리자 그룹 **공용** |

- Windows에서 관리자 계정은 개인 `authorized_keys`가 아니라 **관리자 공용 파일**을 보는 점에 주의한다.

---

## 4. 경험과 교훈 / 트러블슈팅

### ❌ 헷갈렸던 점: "RDP 계정과 SSH 계정은 따로다"

처음엔 RDP 계정과 SSH 계정이 서로 별도로 관리되는 줄 알았다.

**원인**: sshd가 자체 계정 DB를 가진다고 오해했다. 실제로 sshd엔 계정 저장소가 없고, OS 계정 저장소에 인증을 위임할 뿐이다.

**교훈**: "따로 관리되는 것"은 계정이 아니라 **게이트(출입 권한)**다. 계정은 하나, 출입문과 권한이 둘이다.

### ❌ Microsoft 계정(MSA)으로 로그인한 Windows: RDP 자격증명으로 SSH가 안 됨

MSA로 로그인한 Windows는 **RDP 자격증명만으로 SSH 접속이 대체로 불가**하다.

**원인**:
- SSH 사용자명이 **이메일이 아니라 로컬 프로필명**이다.
- "Windows Hello 로그인만 허용" 정책이 password SSH를 차단한다.
- **PIN으로는 SSH 불가**하다. PIN은 로컬 기기 인증 수단일 뿐, SSH엔 실제 계정 비밀번호가 필요하다.

**해결 방향**:
- SSH 사용자명은 이메일이 아닌 로컬 프로필명을 사용한다.
- password SSH가 막혀 있으면 **공개키 인증**으로 우회하거나, 계정에 실제 비밀번호를 설정한다.

---

## 5. Best Practices
- **계정과 게이트를 분리해서 사고한다.** "SSH가 안 된다"를 만나면 계정이 아니라 SSH 게이트(`sshd_config`)부터 확인한다.
- **SSH 허용 범위는 화이트리스트로 좁힌다.** `AllowUsers`/`AllowGroups`로 필요한 계정만 연다.
- **Windows 관리자 키는 공용 파일 위치를 기억한다.** 개인 `authorized_keys`에 넣으면 적용되지 않는다 (`administrators_authorized_keys` 사용).
- **MSA 환경에선 공개키 인증을 우선 검토한다.** PIN·Hello 정책이 password SSH를 막는 경우가 잦다.

---

## 관련 문서
- [[4. git bare 초기 준비]] — SSH 키 생성·등록 흐름

## 참고자료
- OpenSSH for Windows: `administrators_authorized_keys` 동작
