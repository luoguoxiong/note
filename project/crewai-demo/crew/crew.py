"""定义一个三角色的研究写作团队（Crew）。

Agent / Task 的提示词全部放在 config/*.yaml 中，改文案即可换场景，
无需改动代码。
"""

import os
from pathlib import Path

from crewai import Agent, Crew, LLM, Process, Task
from crewai.project import CrewBase, agent, crew, task

CONFIG_DIR = Path(__file__).parent / "config"


def build_llm() -> LLM:
    """按环境变量构建 LLM，默认 OpenAI，可切换任意 OpenAI 兼容服务。"""
    return LLM(
        model=os.getenv("MODEL", "openai/gpt-4o-mini"),
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL") or os.getenv("OPENAI_API_BASE"),
    )


@CrewBase
class ResearchCrew:
    """研究员 -> 作家 -> 编辑 的顺序流水线。"""

    agents_config = str(CONFIG_DIR / "agents.yaml")
    tasks_config = str(CONFIG_DIR / "tasks.yaml")

    @agent
    def researcher(self) -> Agent:
        return Agent(config=self.agents_config["researcher"], llm=build_llm())

    @agent
    def writer(self) -> Agent:
        return Agent(config=self.agents_config["writer"], llm=build_llm())

    @agent
    def reviewer(self) -> Agent:
        return Agent(config=self.agents_config["reviewer"], llm=build_llm())

    @task
    def research_task(self) -> Task:
        return Task(config=self.tasks_config["research_task"])

    @task
    def writing_task(self) -> Task:
        return Task(config=self.tasks_config["writing_task"])

    @task
    def review_task(self) -> Task:
        return Task(config=self.tasks_config["review_task"])

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
