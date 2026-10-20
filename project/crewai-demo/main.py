"""CrewAI Demo 入口：三角色流水线（研究员 -> 作家 -> 编辑）。

用法：
    python main.py                     # 使用默认主题
    python main.py "你想研究的主题"     # 自定义主题
"""

import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

from crew.crew import ResearchCrew

DEFAULT_TOPIC = "2026 年 AI Agent 框架的发展趋势"


def main() -> None:
    load_dotenv()

    topic = " ".join(sys.argv[1:]).strip() or DEFAULT_TOPIC
    print(f"主题：{topic}\n")

    research_crew = ResearchCrew()
    crew = research_crew.crew()
    result = crew.kickoff(inputs={"topic": topic})

    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    out_path = output_dir / f"report_{datetime.now():%Y%m%d_%H%M%S}.md"
    out_path.write_text(result.raw, encoding="utf-8")

    print("\n" + "=" * 50)
    print("最终产出：")
    print(result.raw)
    print("=" * 50)
    print(f"报告已保存到：{out_path}")
    print(f"\nToken 用量：\n{crew.usage_metrics}")


if __name__ == "__main__":
    main()
