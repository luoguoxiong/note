#!/usr/bin/env bash
# micro-demo 快速启动脚本(pnpm workspace)
# 用法:
#   ./start.sh              自动检测并安装依赖(若缺失),然后并行启动所有应用
#   ./start.sh install      强制重新安装所有应用的依赖
#   ./start.sh build        构建所有应用产物
#   ./start.sh stop         停止所有正在运行的应用

set -e

# 切换到脚本所在目录(项目根目录)
cd "$(dirname "$0")"

# 微前端演示应用配置: (name, 目录, 端口)
APPS=(
  "main-app:main-app:8000"
  "sub-app-1:micro-app-1:8001"
  "sub-app-2:micro-app-2:8002"
  "micro-app:micro-app:8004"
)
DEMO_DIR="micro-demo"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[start]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
err()  { echo -e "${RED}[err]${NC} $1"; }

# 检查命令是否存在
command -v node >/dev/null 2>&1 || { err "未检测到 node,请先安装 Node.js"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { err "未检测到 pnpm,请先安装 pnpm"; exit 1; }

# 安装依赖
install_all() {
  log "安装所有应用依赖..."
  pnpm install
  log "所有依赖安装完成"
}

# 确保依赖已安装(缺失才装)
ensure_deps() {
  if [ ! -d "node_modules" ]; then
    warn "缺少 node_modules,开始安装..."
    install_all
  fi
  for app_entry in "${APPS[@]}"; do
    local dir
    dir="$DEMO_DIR/$(echo "$app_entry" | cut -d: -f2)"
    if [ ! -d "$dir/node_modules" ]; then
      warn "$dir 缺少 node_modules,开始安装..."
      install_all
      break
    fi
  done
}

# 构建所有应用
build_all() {
  ensure_deps
  log "构建所有应用..."
  for app_entry in "${APPS[@]}"; do
    local name
    name=$(echo "$app_entry" | cut -d: -f1)
    log "构建: $name"
    pnpm --filter "$name" build
  done
  log "所有应用构建完成"
}

PIDS=()

# 清理: 杀掉所有后台进程
cleanup() {
  echo
  log "正在停止所有应用..."
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  # 杀掉占用端口的进程(兜底)
  for app_entry in "${APPS[@]}"; do
    local port
    port=$(echo "$app_entry" | cut -d: -f3)
    local pid
    pid=$(lsof -ti :"$port" 2>/dev/null || true)
    [ -n "$pid" ] && kill "$pid" 2>/dev/null || true
  done
  log "已停止"
  exit 0
}
trap cleanup INT TERM EXIT

# 给输出加前缀
prefix_stream() {
  local name="$1"
  local color="$2"
  while IFS= read -r line; do
    printf "${color}[%s]${NC} %s\n" "$name" "$line"
  done
}

# 并行启动所有应用
start_all() {
  ensure_deps

  log "启动微前端演示应用..."
  for app_entry in "${APPS[@]}"; do
    local name port
    name=$(echo "$app_entry" | cut -d: -f1)
    port=$(echo "$app_entry" | cut -d: -f3)
    echo -e "  ${BLUE}${name}${NC} -> http://localhost:${port}"
  done
  echo -e "  按 ${YELLOW}Ctrl+C${NC} 停止所有应用"
  echo

  # 检查端口是否被占用
  for app_entry in "${APPS[@]}"; do
    local port
    port=$(echo "$app_entry" | cut -d: -f3)
    if lsof -i :"$port" >/dev/null 2>&1; then
      warn "端口 $port 已被占用,可能已有应用在运行"
    fi
  done

  # 并行启动: 使用 pnpm --filter 通过 workspace 管理
  for app_entry in "${APPS[@]}"; do
    local name color
    name=$(echo "$app_entry" | cut -d: -f1)
    case "$name" in
      "main-app")   color="$BLUE" ;;
      "sub-app-1")  color="$RED" ;;
      "sub-app-2")  color="$YELLOW" ;;
      "micro-app")  color="$GREEN" ;;
      *)            color="$NC" ;;
    esac
    pnpm --filter "$name" dev > >(prefix_stream "$name" "$color") 2>&1 &
    PIDS+=($!)
  done

  log "全部已启动,等待编译完成...(首次启动较慢)"
  wait
}

# 停止所有应用(通过端口)
stop_all() {
  log "停止所有应用..."
  for app_entry in "${APPS[@]}"; do
    local port
    port=$(echo "$app_entry" | cut -d: -f3)
    local pid
    pid=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pid" ]; then
      kill "$pid" 2>/dev/null || true
      log "已停止端口 $port 上的进程 (pid: $pid)"
    fi
  done
  log "完成"
  exit 0
}

# 入口
case "${1:-start}" in
  start)
    start_all
    ;;
  install)
    install_all
    ;;
  build)
    build_all
    ;;
  stop)
    stop_all
    ;;
  restart)
    stop_all
    start_all
    ;;
  *)
    echo "用法: $0 {start|install|build|stop|restart}"
    echo "  start    - 自动安装缺失依赖并并行启动所有应用 (默认)"
    echo "  install  - 强制重新安装所有应用依赖"
    echo "  build    - 构建所有应用产物到各自 dist 目录"
    echo "  stop     - 停止所有运行中的应用"
    echo "  restart  - 重启所有应用"
    exit 1
    ;;
esac
