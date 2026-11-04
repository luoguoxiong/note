#!/usr/bin/env bash
# netc-pc-web-admin 快速启动脚本
# 用法:
#   ./start.sh              启动主项目 + micro-test 子项目 (默认)
#   ./start.sh main         仅启动主项目
#   ./start.sh micro-test   仅启动 micro-test 子项目
#   ./start.sh install      安装所有依赖
#   ./start.sh stop         停止所有正在运行的进程
#   ./start.sh restart      重启所有

set -e

# 切换到脚本所在目录(项目根目录)
cd "$(dirname "$0")"
ROOT_DIR=$(pwd)

# ====================== 颜色 ======================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[start]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
err()  { echo -e "${RED}[err]${NC} $1"; }

# ====================== 检查 ======================
command -v node >/dev/null 2>&1 || { err "未检测到 node，请先安装 Node.js"; exit 1; }
command -v yarn >/dev/null 2>&1 || { err "未检测到 yarn，请先安装 yarn"; exit 1; }

# ====================== 应用配置 ======================
# 每个应用使用独立的变量定义，避免复杂解析
# 格式: name, dir, cmd, port

MAIN_NAME="主项目"
MAIN_DIR="."
MAIN_CMD="yarn serve:uat"
MAIN_PORT="8080"

SUB1_NAME="sub-app-1"
SUB1_DIR="micro-test/micro-module-1"
SUB1_CMD="yarn dev"
SUB1_PORT="8001"

SUB2_NAME="sub-app-2"
SUB2_DIR="micro-test/micro-module-2"
SUB2_CMD="yarn dev"
SUB2_PORT="8002"

MICRO_NAME="micro-app"
MICRO_DIR="micro-test/micro-app"
MICRO_CMD="yarn dev"
MICRO_PORT="8004"

# 获取应用的 color
get_color() {
  case "$1" in
    "主项目"*)    echo "$BLUE" ;;
    "sub-app-1") echo "$RED" ;;
    "sub-app-2") echo "$YELLOW" ;;
    "micro-app") echo "$GREEN" ;;
    *)           echo "$NC" ;;
  esac
}

# 根据模式打印应用列表
list_apps() {
  local mode="$1"
  case "$mode" in
    main)
      printf "  ${CYAN}%s${NC} -> http://localhost:%s\n" "$MAIN_NAME" "$MAIN_PORT"
      ;;
    micro-test)
      printf "  ${CYAN}%s${NC} -> http://localhost:%s\n" "$SUB1_NAME" "$SUB1_PORT"
      printf "  ${CYAN}%s${NC} -> http://localhost:%s\n" "$SUB2_NAME" "$SUB2_PORT"
      printf "  ${CYAN}%s${NC} -> http://localhost:%s\n" "$MICRO_NAME" "$MICRO_PORT"
      ;;
    all)
      printf "  ${CYAN}%s${NC} -> http://localhost:%s\n" "$MAIN_NAME" "$MAIN_PORT"
      printf "  ${CYAN}%s${NC} -> http://localhost:%s\n" "$SUB1_NAME" "$SUB1_PORT"
      printf "  ${CYAN}%s${NC} -> http://localhost:%s\n" "$SUB2_NAME" "$SUB2_PORT"
      printf "  ${CYAN}%s${NC} -> http://localhost:%s\n" "$MICRO_NAME" "$MICRO_PORT"
      ;;
  esac
}

# ====================== 安装依赖 ======================
install_all() {
  log "安装主项目依赖..."
  cd "$ROOT_DIR"
  yarn install

  log "安装 micro-test 子应用依赖..."
  for entry_dir in "$SUB1_DIR" "$SUB2_DIR" "$MICRO_DIR"; do
    if [ -d "$ROOT_DIR/$entry_dir" ]; then
      log "安装 $entry_dir 依赖..."
      cd "$ROOT_DIR/$entry_dir"
      # 复制根目录 yarn.lock，让子项目可解析 workspace:* 协议
      if [ -f "$ROOT_DIR/yarn.lock" ]; then
        cp "$ROOT_DIR/yarn.lock" "$ROOT_DIR/$entry_dir/yarn.lock"
      fi
      yarn install
    fi
  done

  cd "$ROOT_DIR"
  log "所有依赖安装完成"
}

ensure_deps() {
  local mode="$1"
  local need_install=false

  # 检查主项目
  if [ "$mode" = "all" ] || [ "$mode" = "main" ]; then
    if [ ! -d "$ROOT_DIR/node_modules" ]; then
      warn "主项目缺少 node_modules"
      need_install=true
    fi
  fi

  # 检查 micro-test 子应用
  if [ "$mode" = "all" ] || [ "$mode" = "micro-test" ]; then
    for entry_dir in "$SUB1_DIR" "$SUB2_DIR" "$MICRO_DIR"; do
      if [ -d "$ROOT_DIR/$entry_dir" ] && [ ! -d "$ROOT_DIR/$entry_dir/node_modules" ]; then
        warn "$entry_dir 缺少 node_modules"
        need_install=true
        break
      fi
    done
  fi

  if [ "$need_install" = true ]; then
    install_all
  fi
}

# ====================== 进程管理 ======================
PIDS=()

cleanup() {
  echo
  log "正在停止所有进程..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  # 兜底：杀掉占用端口的进程
  for port in "$MAIN_PORT" "$SUB1_PORT" "$SUB2_PORT" "$MICRO_PORT"; do
    local pid
    pid=$(lsof -ti :"$port" 2>/dev/null || true)
    [ -n "$pid" ] && kill "$pid" 2>/dev/null || true
  done
  log "已停止所有进程"
  exit 0
}
trap cleanup INT TERM EXIT

# ====================== 启动 ======================
start_all() {
  local mode="$1"
  ensure_deps "$mode"

  log "启动应用..."
  echo -e "  ${BLUE}模式${NC}: $mode"
  list_apps "$mode"
  echo -e "  按 ${YELLOW}Ctrl+C${NC} 停止所有应用"
  echo

  # 检查端口占用 + 启动应用
  launch() {
    local name="$1"
    local dir="$2"
    local cmd="$3"
    local port="$4"
    local color
    color=$(get_color "$name")

    if lsof -i :"$port" >/dev/null 2>&1; then
      warn "端口 $port 已被占用，$name 可能已有实例在运行"
    fi

    cd "$ROOT_DIR/$dir"
    $cmd > >(while IFS= read -r line; do printf "${color}[%s]${NC} %s\n" "$name" "$line"; done) 2>&1 &
    PIDS+=($!)
  }

  if [ "$mode" = "main" ] || [ "$mode" = "all" ]; then
    launch "$MAIN_NAME" "$MAIN_DIR" "$MAIN_CMD" "$MAIN_PORT"
  fi

  if [ "$mode" = "micro-test" ] || [ "$mode" = "all" ]; then
    launch "$SUB1_NAME" "$SUB1_DIR" "$SUB1_CMD" "$SUB1_PORT"
    launch "$SUB2_NAME" "$SUB2_DIR" "$SUB2_CMD" "$SUB2_PORT"
    launch "$MICRO_NAME" "$MICRO_DIR" "$MICRO_CMD" "$MICRO_PORT"
  fi

  cd "$ROOT_DIR"
  log "全部已启动，等待编译完成...（首次启动较慢）"
  wait
}

# ====================== 停止 ======================
stop_all() {
  local mode="$1"
  log "停止所有进程..."

  kill_by_port() {
    local name="$1"
    local port="$2"
    local pid
    pid=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pid" ]; then
      kill "$pid" 2>/dev/null || true
      log "已停止 ${name} (pid: $pid)"
    fi
  }

  if [ "$mode" = "main" ] || [ "$mode" = "all" ]; then
    kill_by_port "$MAIN_NAME" "$MAIN_PORT"
  fi

  if [ "$mode" = "micro-test" ] || [ "$mode" = "all" ]; then
    kill_by_port "$SUB1_NAME" "$SUB1_PORT"
    kill_by_port "$SUB2_NAME" "$SUB2_PORT"
    kill_by_port "$MICRO_NAME" "$MICRO_PORT"
  fi

  log "完成"
  exit 0
}

# ====================== 入口 ======================
MODE="${1:-all}"

case "$MODE" in
  all|main|micro-test)
    start_all "$MODE"
    ;;
  install)
    install_all
    ;;
  stop)
    stop_all all
    ;;
  restart)
    stop_all all
    start_all all
    ;;
  *)
    echo "用法: $0 {all|main|micro-test|install|stop|restart}"
    echo ""
    echo "  默认:       启动主项目 + micro-test 子项目"
    echo "  all         启动主项目 + micro-test 子项目"
    echo "  main        仅启动主项目 (端口 $MAIN_PORT)"
    echo "  micro-test  仅启动 micro-test 子项目 ($SUB1_PORT, $SUB2_PORT, $MICRO_PORT)"
    echo "  install     安装所有依赖"
    echo "  stop        停止所有运行中的应用"
    echo "  restart     重启所有应用"
    exit 1
    ;;
esac
