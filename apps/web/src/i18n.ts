import i18next from "i18next";
import { initReactI18next } from "react-i18next";

const StorageKey = "niche.web.lang";

type SupportedLanguage = "en" | "zh";

const detectInitialLanguage = (): SupportedLanguage => {
  try {
    const stored = globalThis.localStorage?.getItem(StorageKey);
    if (stored === "en" || stored === "zh") {
      return stored;
    }
  } catch {
    // ignore
  }

  const navLang = globalThis.navigator?.language ?? "";
  return navLang.toLowerCase().startsWith("zh") ? "zh" : "en";
};

void i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          common: {
            copied: "Copied",
            copyFailed: "Copy failed",
            running: "Running",
            close: "Close",
            export: "Export",
            copy: "Copy",
            download: "Download",
            downloaded: "Downloaded",
            downloadFailed: "Download failed",
            payload: "payload",
            raw: "raw",
            source: "Source",
            languageToggleZh: "中文",
            languageToggleEn: "EN"
          },
          app: {
            title: "Niche Study Copilot",
            cached: "Cached",
            exportMarkdown: "Export Markdown",
            settings: "Settings",
            environmentConfig: "Environment Config",
            tenantId: "Tenant ID",
            projectId: "Project ID",
            apiStatus: "API Status",
            error: "Error",
            startHint: "Start a research task by entering a prompt below.",
            references: "References",
            askAnything: "Ask anything...",
            stop: "Stop",
            run: "Run",
            template: "Template"
          },
          streamOutput: {
            title: "Output",
            autoScroll: "Auto-scroll",
            empty: "(no output yet)"
          },
          stepTimeline: {
            title: "Step events",
            groupByStep: "Group by step",
            searchPlaceholder: "Search events",
            empty: "(no events yet)",
            copyJson: "Copy JSON"
          },
          citations: {
            title: "Citations",
            empty: "(no citations yet)"
          },
          evidence: {
            title: "Evidence",
            selectCitation: "(select a citation)",
            notLoaded: "(not loaded)",
            loading: "Loading evidence for {{citationId}}...",
            openSource: "Open source",
            highlightPlaceholder: "Highlight keyword",
            copySnippet: "Copy snippet"
          },
          evidenceSidebar: {
            title: "Source Evidence",
            loading: "Loading source...",
            loadFailed: "Failed to load evidence.",
            quoteMatch: "Quote Match"
          },
          thinkingPanel: {
            thinking: "Agent is thinking...",
            title: "Thought Process"
          },
          runPanel: {
            title: "Run",
            tenantId: "tenantId",
            projectId: "projectId",
            template: "template",
            prompt: "prompt",
            loading: "Loading...",
            cancel: "Cancel",
            retry: "Retry",
            taskId: "taskId",
            sessionId: "sessionId",
            stage: "stage",
            templateRef: "templateRef"
          }
        }
      },
      zh: {
        translation: {
          common: {
            copied: "已复制",
            copyFailed: "复制失败",
            running: "运行中",
            close: "关闭",
            export: "导出",
            copy: "复制",
            download: "下载",
            downloaded: "已下载",
            downloadFailed: "下载失败",
            payload: "payload",
            raw: "raw",
            source: "来源",
            languageToggleZh: "中文",
            languageToggleEn: "EN"
          },
          app: {
            title: "Niche Study Copilot",
            cached: "已缓存",
            exportMarkdown: "导出 Markdown",
            settings: "设置",
            environmentConfig: "环境配置",
            tenantId: "租户 ID",
            projectId: "项目 ID",
            apiStatus: "API 状态",
            error: "错误",
            startHint: "在下方输入 prompt 并开始一次运行。",
            references: "参考资料",
            askAnything: "随便问点什么…",
            stop: "停止",
            run: "运行",
            template: "模板"
          },
          streamOutput: {
            title: "输出",
            autoScroll: "自动滚动",
            empty: "（暂无输出）"
          },
          stepTimeline: {
            title: "步骤事件",
            groupByStep: "按步骤分组",
            searchPlaceholder: "搜索事件",
            empty: "（暂无事件）",
            copyJson: "复制 JSON"
          },
          citations: {
            title: "引用",
            empty: "（暂无引用）"
          },
          evidence: {
            title: "证据",
            selectCitation: "（请选择一条引用）",
            notLoaded: "（未加载）",
            loading: "正在加载证据：{{citationId}}...",
            openSource: "打开来源",
            highlightPlaceholder: "高亮关键词",
            copySnippet: "复制片段"
          },
          evidenceSidebar: {
            title: "来源证据",
            loading: "正在加载来源...",
            loadFailed: "证据加载失败。",
            quoteMatch: "匹配片段"
          },
          thinkingPanel: {
            thinking: "Agent 思考中...",
            title: "思维过程"
          },
          runPanel: {
            title: "运行",
            tenantId: "租户 ID",
            projectId: "项目 ID",
            template: "模板",
            prompt: "提示词",
            loading: "加载中...",
            cancel: "取消",
            retry: "重试",
            taskId: "任务 ID",
            sessionId: "会话 ID",
            stage: "阶段",
            templateRef: "模板引用"
          }
        }
      }
    },
    lng: detectInitialLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export const i18n = i18next;

export const setLanguage = async (lng: SupportedLanguage): Promise<void> => {
  try {
    globalThis.localStorage?.setItem(StorageKey, lng);
  } catch {
    // ignore
  }
  await i18next.changeLanguage(lng);
};

export const getLanguage = (): SupportedLanguage => {
  return i18next.language.toLowerCase().startsWith("zh") ? "zh" : "en";
};
