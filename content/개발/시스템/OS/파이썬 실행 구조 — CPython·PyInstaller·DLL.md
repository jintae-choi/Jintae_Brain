---
title: 🐍 파이썬 실행 구조 — CPython·PyInstaller·DLL
tags:
  - 파이썬
  - CPython
  - PyInstaller
  - DLL
  - 윈도우
date: 2026-09-17
---

## 개요
> 파이썬 소스 코드가 CPython을 거쳐 CPU에서 실행되기까지의 사슬, CPython이 설치되지 않은 컴퓨터에서도 실행 파일 하나로 돌게 만드는 PyInstaller의 구조, 그 둘을 잇는 DLL을 정리한다. 커널 아래 계층은 [[운영체제 구조 — 커널·유저랜드·시스템콜]].

---

## 1. 전체 개념 / 흐름

### 1-1. 큰 그림 — 파이썬 코드가 실행되는 흐름

```
[파이썬 소스 코드]  app.py
   ↓ ① CPython 컴파일러가 소스 코드를 바이트코드로 변환
[바이트코드]  app.pyc  (CPython 가상 머신 전용 명령어)
   ↓ ② CPython 가상 머신이 바이트코드를 한 명령씩 읽고,
       명령마다 미리 기계어로 만들어진 처리 코드를 실행
       (이 부분을 "평가 루프"라고 부르며, 소스 파일 이름은 ceval.c)
[기계어]  CPU가 직접 실행
   ↓ ③ 파일·화면·네트워크 작업은 Win32 API로 요청
[Win32 API]  kernel32.dll · user32.dll
   ↓ ④ ntdll.dll 을 거쳐 시스템 호출
[Windows NT 커널]  ntoskrnl.exe
```

- ①과 ②를 합친 프로그램이 **CPython**이다. CPython은 파이썬 공식 구현체이며, C 언어로 작성돼 있다.
- 윈도우에서 CPython의 핵심은 **`python312.dll`** 에 들어 있고, `python.exe`는 이 DLL을 불러오는 작은 실행 파일이다.
- "파이썬 설치"는 CPython(`python.exe` + `python312.dll` + 표준 라이브러리)을 디스크에 두고 PATH 환경 변수와 레지스트리에 등록하는 작업이다.

### 1-2. 사전 지식 / 용어

- **바이트코드(bytecode)** — CPython 가상 머신 전용 명령어. CPU가 직접 읽는 기계어가 아니다. `.pyc` 파일에 저장된다.
- **평가 루프(evaluation loop)** — CPython 가상 머신이 바이트코드를 한 명령씩 읽어 처리 코드를 실행하는 부분. CPython 소스 파일 이름은 `ceval.c`.
- **Win32 API** — 윈도우가 응용 프로그램에 제공하는 함수 모음. `kernel32.dll`·`user32.dll` 등이 담고 있다.
- **`ntdll.dll`** — Win32 API 호출을 시스템 호출로 바꿔 커널에 넘기는 계층. 유저 모드의 마지막 단계다.
- **`ntoskrnl.exe`** — Windows NT 커널 본체 실행 파일. 시스템 호출은 여기서 처리된다.
- **PE(Portable Executable)** — 윈도우 실행 파일 형식. `.exe`와 `.dll`이 같은 형식을 쓴다.
- **Windows 로더** — `LoadLibrary`로 DLL을 불러오는 윈도우 구성요소. **디스크에 있는 파일만** 로드할 수 있다.
- **확장 모듈(`.pyd`)** — C로 만든 파이썬 모듈. 예: `_ssl.pyd`, `_ctypes.pyd`.

### 1-3. 비교 — CPython이 있는 컴퓨터 vs 없는 컴퓨터

| 항목 | 개발자 컴퓨터 (CPython 설치됨) | 사용자 컴퓨터 (CPython 설치 안 됨) |
|---|---|---|
| 실행 대상 | `app.py` 소스 파일 | PyInstaller가 만든 `myapp.exe` |
| CPython 위치 | 디스크에 설치된 `python312.dll` | exe 안에 묶여 있다가 임시 폴더로 추출됨 |
| 실행 시작 주체 | `python.exe` | PyInstaller 부트로더 (이미 기계어라 CPython 없이 실행됨) |
| 바이트코드 | 실행 시점에 소스에서 변환 | 빌드 시점에 미리 변환돼 PYZ 아카이브에 압축됨 |

**PyInstaller 빌드 방식 비교**

| 빌드 방식 | 결과물 | 프로세스 수 | 시작 속도 |
|---|---|---|---|
| onefile | exe 하나 | 2개 (부트로더 부모 + 자식) | 매번 추출하므로 느림 |
| onedir | 폴더 하나 (이미 추출된 상태) | 1개 | 빠름 |

### 1-4. 구성요소 역할

| 구성요소 | 역할 | 수명 |
|---|---|---|
| CPython 컴파일러 | 소스 코드를 바이트코드로 변환 | 실행 시작 시점 (PyInstaller는 빌드 시점) |
| CPython 가상 머신 | 바이트코드를 한 명령씩 읽어 기계어 처리 코드를 실행 | 프로세스 전체 |
| `python312.dll` | CPython 본체 (컴파일러 + 가상 머신 + 핵심 내장 모듈) | 프로세스에 로드된 동안 |
| `python.exe` | `python312.dll`을 불러오는 작은 실행 파일 | 프로세스 전체 |
| PyInstaller 부트로더 | C로 미리 빌드된 실행 파일. 추출·자식 프로세스 실행·정리 담당 | 앱 종료 후 정리까지 |
| CArchive | 부트로더 뒤에 붙는 전체 묶음 (PYZ·DLL·데이터 파일) | 빌드 결과물에 고정 |
| PYZ 아카이브 | 순수 파이썬 모듈의 바이트코드 압축본 | CArchive 내부 |

---

## 2. 전체 예시 코드 — PyInstaller 빌드와 실행

**만드는 쪽 (개발자 컴퓨터, CPython 설치됨)**

```
① Analysis(의존성 분석)
   진입 스크립트부터 import 문을 따라가며 필요한 모듈을 전부 수집
② 수집
   - 순수 파이썬 모듈 → 바이트코드로 변환 → PYZ 아카이브로 압축
   - CPython 본체 python312.dll
   - 확장 모듈(.pyd = C로 만든 파이썬 모듈. 예: _ssl.pyd)
   - 확장 모듈이 쓰는 DLL(libssl-3.dll 등)
   - 데이터 파일(certifi 인증서 묶음, locale 번역 파일)
③ 조립
   PyInstaller 부트로더(C로 미리 빌드된 실행 파일)
   + CArchive(②의 전체 묶음)
   → myapp.exe
```

**쓰는 쪽 (사용자 컴퓨터, CPython 설치 안 됨)**

```
① exe 실행 → PyInstaller 부트로더가 부모 프로세스로 시작
   (부트로더는 이미 기계어라 CPython 없이 실행됨)
② 부트로더가 CArchive를 %TEMP%\_MEIxxxxxx 에 추출
   (앱 안에서는 이 경로를 sys._MEIPASS 로 참조)
③ 부트로더가 같은 exe를 자식 프로세스로 실행
④ 자식 프로세스가 추출된 python312.dll을 로드해 CPython을 초기화하고,
   PYZ 아카이브의 바이트코드를 CPython 가상 머신으로 실행
⑤ 자식 프로세스 종료 → 부모 프로세스가 _MEIxxxxxx 삭제 후 종료
```

**DLL 호출 사슬 (자식 프로세스 기준)**

```
자식 프로세스(myapp.exe)
 → Windows 로더가 python312.dll 로드 → CPython 함수 호출
    → python312.dll 이 VCRUNTIME140.dll 호출
      (Microsoft Visual C++ 런타임 = C 언어 기본 함수)
    → kernel32.dll 호출 (Win32 API)
      → ntdll.dll → Windows NT 커널
```

---

## 3. 포인트별 상세 해설

### 3-1. PyInstaller 빌드 단계 용어

- `Analysis` — 진입 스크립트의 `import` 문을 따라가며 필요한 모듈을 수집하는 단계.
- `PYZ 아카이브` — 순수 파이썬 모듈의 바이트코드를 모아 압축한 묶음.
- `CArchive` — PYZ·`python312.dll`·확장 모듈·데이터 파일을 합친 전체 묶음. 부트로더 뒤에 붙어 exe 하나가 된다.
- `.pyd` — C로 만든 파이썬 확장 모듈. 형식은 DLL과 같다.

### 3-2. 실행 단계 경로·변수

- `%TEMP%` — 윈도우 임시 폴더를 가리키는 환경 변수.
- `_MEIxxxxxx` — 부트로더가 CArchive를 푸는 임시 폴더. 뒤의 숫자는 실행할 때마다 달라진다.
- `sys._MEIPASS` — 추출된 폴더 경로를 앱 코드 안에서 읽는 변수. 데이터 파일을 찾을 때 사용한다.

### 3-3. DLL 목록

| DLL | 역할 |
|---|---|
| `python312.dll` | CPython (컴파일러 + 가상 머신 + 핵심 내장 모듈) |
| `VCRUNTIME140.dll` | Microsoft Visual C++ 런타임 |
| `libssl-3.dll`, `libcrypto-3.dll` | OpenSSL (HTTPS 암호화 통신) |
| `libffi-8.dll` | libffi (파이썬에서 C 함수를 호출할 때 사용, `_ctypes.pyd`가 사용) |
| `kernel32.dll` (윈도우 내장) | Win32 API |

> **용어박스: DLL (Dynamic Link Library, 동적 연결 라이브러리)**
> DLL은 다른 실행 파일이 실행 중에 로드해서 호출하는 기계어 함수 모음이다.
> 형식은 exe와 같은 PE(Portable Executable)이지만, 혼자서는 실행되지 않는다.

---

## 4. 핵심 통찰 — onefile 방식에서 프로세스가 2개인 이유

프로세스가 둘로 갈라지는 원인은 윈도우의 제약 두 가지다.

- **Windows 로더는 디스크에 있는 파일만 로드할 수 있다.** exe 안에 들어 있는 `python312.dll`을 바로 못 쓰므로, 추출이 먼저 필요하다.
- **윈도우는 로드된 DLL 파일의 삭제를 막는다.** `python312.dll`을 로드한 자식 프로세스는 자기 추출 폴더를 지울 수 없다. 그래서 DLL을 로드하지 않은 부모 프로세스(부트로더)가 정리를 맡는다.

---

## 5. 경험과 교훈 — onefile 트레이 앱 실측 예시

| 항목 | 값 |
|---|---|
| exe 크기 | 13MB |
| 추출 폴더 `_MEIxxxxxx` | 23MB, 항목 28개 |
| 부모 프로세스(부트로더) 메모리 | 약 10MB |
| 자식 프로세스(CPython 실행) 메모리 | 약 100MB |

- exe 13MB가 실행 시점에 23MB로 풀린다. 디스크·시작 시간 비용이 매 실행마다 발생한다.
- 작업 관리자에 같은 이름의 프로세스가 2개 보이는 것은 정상이다. 메모리를 크게 쓰는 쪽이 실제 앱(자식)이다.

---

## 6. Best Practices

- **시작 속도가 중요하면 onedir, 배포 편의가 중요하면 onefile을 선택한다.** onefile은 매 실행마다 추출한다.
- **DLL로 나누는 이점 세 가지를 기억한다.**
  - **공유** — 여러 프로그램이 같은 DLL을 함께 쓴다.
  - **교체** — 보안 패치 때 DLL만 바꾸면 된다.
  - **지연 로드** — 필요할 때만 메모리에 올린다.
- **데이터 파일 경로는 `sys._MEIPASS` 기준으로 잡는다.** 스크립트 파일 위치 기준으로 잡으면 exe로 묶었을 때 깨진다.

---

## 관련 문서
- [[운영체제 구조 — 커널·유저랜드·시스템콜]] — 이 문서의 ③·④ 아래 계층(시스템 콜·커널·유저랜드)

## 참고자료
- CPython 공식 구현체 (`ceval.c` 평가 루프)
- PyInstaller 공식 문서 (Analysis · PYZ · CArchive · 부트로더)
