# CrewAI Demo

一个最小可运行的 [CrewAI](https://docs.crewai.com/) 多智能体示例：
**研究员 -> 作家 -> 编辑** 三角色顺序流水线，按输入主题产出一篇深度文章。

## 目录结构

```
crewai-demo/
├── main.py                  # 入口：kickoff 并保存产出
├── crew/
│   ├── crew.py              # Crew 定义（Agent/Task 装配 + LLM 配置）
│   └── config/
│       ├── agents.yaml      # 三个 Agent 的 role/goal/backstory
│       └── tasks.yaml       # 三个任务的描述与依赖（context）
├── requirements.txt
└── .env.example             # 环境变量模板（复制为 .env 使用）
```

## 快速开始

```bash
# 1. 安装（Python 3.10 - 3.13）
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. 配置 LLM：复制 .env.example 为 .env，填入 API Key
#    支持 OpenAI 官方，或 DeepSeek / 智谱 GLM / Moonshot 等任意 OpenAI 兼容服务
cp .env.example .env

# 3. 运行
python main.py                              # 默认主题
python main.py "智能体在 2026 年的落地现状"   # 自定义主题
```

运行日志会实时展示每个 Agent 的思考与产出，最终报告保存在 `output/` 目录。

## 工作流说明

- 顺序执行：`research_task` -> `writing_task` -> `review_task`；
  后置任务通过 `context` 自动读取前置任务的产出。
- 提示词集中在 `crew/config/*.yaml`，改文案即可换场景，无需改代码。
- LLM 通过 `.env` 切换：`MODEL` + `OPENAI_BASE_URL` 即可对接任意 OpenAI 兼容服务。

## 扩展：接入联网搜索（可选）

```bash
pip install crewai-tools
```

```python
# crew/crew.py 中给 researcher 挂载搜索工具（需要 SERPER_API_KEY）
from crewai_tools import SerperDevTool

@agent
def researcher(self) -> Agent:
    return Agent(
        config=self.agents_config["researcher"],
        llm=build_llm(),
        tools=[SerperDevTool()],
    )
```
