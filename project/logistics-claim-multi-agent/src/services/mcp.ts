import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { config, ROOT_DIR } from '../config.js';
import { withRetry } from './llm.js';

let client: MultiServerMCPClient | null = null;
let toolsByName: Record<string, StructuredToolInterface> | null = null;

const TSX_CLI = `${ROOT_DIR}node_modules/tsx/dist/cli.mjs`;

/**
 * 连接运单 MCP server（stdio 子进程），返回 LangChain 工具表。
 * 启动失败（如 tsx 缺失）时返回空表，调用方降级为直连本地数据源——保证 demo 可用。
 */
export async function getWaybillTools(opts: { timeoutMs?: number } = {}): Promise<{
  tools: Record<string, StructuredToolInterface>;
  viaMcp: boolean;
}> {
  if (toolsByName) return { tools: toolsByName, viaMcp: Object.keys(toolsByName).length > 0 };
  try {
    client = new MultiServerMCPClient({
      mcpServers: {
        waybill: {
          transport: 'stdio',
          command: process.execPath,
          args: [TSX_CLI, `${ROOT_DIR}src/mcp/waybill-server.ts`],
          // 剥离 IDE 注入的 NODE_OPTIONS shim，避免破坏子进程 crypto
          env: { ...process.env, DATABASE_URL: config.databaseUrl, NODE_OPTIONS: '' } as Record<string, string>,
        },
      },
    });
    const tools = await withRetry(
      async () => {
        const t = await client!.getTools();
        if (!t.length) throw new Error('no tools returned');
        return t;
      },
      { retries: 1, baseMs: 1500 },
    );
    toolsByName = {};
    for (const t of tools) {
      toolsByName[t.name] = t;
      // mcp-adapters 2.x 会给工具名加 "<serverName>_" 前缀，建立无前缀别名便于业务侧按名取用
      if (t.name.startsWith('waybill_')) toolsByName[t.name.slice('waybill_'.length)] = t;
    }
  } catch (err: any) {
    console.error(`[mcp] 连接运单 MCP server 失败，降级直连本地数据源: ${err?.message ?? err}`);
    toolsByName = {};
  }
  return { tools: toolsByName, viaMcp: Object.keys(toolsByName).length > 0 };
}

export async function shutdownMcp() {
  try {
    await client?.close();
  } catch {
    /* ignore */
  }
  client = null;
  toolsByName = null;
}
