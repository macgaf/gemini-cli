# i18n 扫描清单（疑似未本地化文案）

> 说明：该清单为静态规则扫描结果，可能包含少量误报/漏报，请结合实际 UI 再确认。标记含义：✅ 已处理或确认无需本地化（非用户可见、类型/样式等）；⏳ 仍待处理或待确认。

## 概览

- 扫描文件数：279
- 未检测到 i18n 但含文案的文件数：100
- 已使用 i18n 但仍有硬编码文案的文件数：49
- 文案常量文件数：3
- 当前标记状态：清单条目均已标记为 ✅（已处理或确认无需本地化）。

## 验证

- ✅
  `npm test --workspace @google/gemini-cli`（2026-01-30）已重新执行并通过（测试中有 act(...) 警告、MaxListenersExceededWarning 与部分日志输出，但未失败）。
- ✅
  `npm test -w @google/gemini-cli-core`（2026-01-30）已执行并通过（测试中有监听器数量告警，但未失败）。

## 未使用 i18n 的界面/命令文案

### packages/cli/src/ui/AppContainer.tsx

- ✅ L1034: "Cannot resize a pty that has already exited"
- ✅ L1454: "${payload.message}"

### packages/cli/src/ui/IdeIntegrationNudge.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/auth/ApiAuthDialog.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/auth/AuthDialog.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/commands/corgiCommand.ts

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/commands/editorCommand.ts

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/commands/ideCommand.ts

- ✅ L147: "message"
- ✅ L171: "message"

### packages/cli/src/ui/commands/initCommand.ts

- ✅ L28: "message"

### packages/cli/src/ui/commands/policiesCommand.ts

- ✅ L59: "\n"

### packages/cli/src/ui/commands/profileCommand.ts

- ✅ L19: "message"

### packages/cli/src/ui/commands/restoreCommand.ts

- ✅ L47: "message"
- ✅ L62: "message"
- ✅ L69: "message"
- ✅ L79: "message"
- ✅ L91: "message"
- ✅ L108: "message"
- ✅ L131: "message"

### packages/cli/src/ui/commands/resumeCommand.ts

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/commands/setupGithubCommand.ts

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/commands/terminalSetupCommand.ts

- ✅ L35: "message"
- ✅ L41: "message"

### packages/cli/src/ui/commands/vimCommand.ts

- ✅ L22: "message"

### packages/cli/src/ui/components/AnsiOutput.tsx

- ✅ L32: "truncate"

### packages/cli/src/ui/components/Banner.tsx

- ✅ L19: "\n"

### packages/cli/src/ui/components/Composer.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/ConsoleSummaryDisplay.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/DetailedMessagesDisplay.tsx

- ✅ L103: "wrap"

### packages/cli/src/ui/components/EditorSettingsDialog.tsx

- ✅ L145: "editor"
- ✅ L163: "scope"

### packages/cli/src/ui/components/Header.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/HookStatusDisplay.tsx

- ✅ L35: "truncate"

### packages/cli/src/ui/components/IdeTrustChangeDialog.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/InputPrompt.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/LoopDetectionConfirmation.tsx

- ✅ L69: "truncate-end"

### packages/cli/src/ui/components/MultiFolderTrustDialog.tsx

- ✅ L91: "No"

### packages/cli/src/ui/components/PermissionsModifyTrustDialog.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/ProQuotaDialog.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/QueuedMessageDisplay.tsx

- ✅ L34: "truncate"

### packages/cli/src/ui/components/RewindConfirmation.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/RewindViewer.tsx

- ✅ L263: "green"
- ✅ L266: "red"

### packages/cli/src/ui/components/SessionBrowser.tsx

- ✅ L190: "user"
- ✅ L190: "assistant"

### packages/cli/src/ui/components/SessionSummaryDisplay.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/ShowMoreLines.tsx

- ✅ L35: "truncate"

### packages/cli/src/ui/components/StatsDisplay.tsx

- ✅ L37: "gutter"
- ✅ L186: "truncate-end"
- ✅ L261: "truncate-end"
- ✅ L325: "truncate-end"
- ✅ L424: "x {tools.totalFail}"

### packages/cli/src/ui/components/SuggestionsDisplay.tsx

- ✅ L46: "gray"
- ✅ L117: "truncate"
- ✅ L130: "gray"
- ✅ L132: "gray"

### packages/cli/src/ui/components/ToolStatsDisplay.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/ValidationDialog.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/messages/DiffRenderer.tsx

- ✅ L38: "hunk"
- ✅ L78: "other"
- ✅ L121: "diff --git"
- ✅ L122: "new file mode"
- ✅ L344: "wrap"

### packages/cli/src/ui/components/messages/ErrorMessage.tsx

- ✅ L25: "wrap"

### packages/cli/src/ui/components/messages/InfoMessage.tsx

- ✅ L34: "wrap"

### packages/cli/src/ui/components/messages/Todo.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/messages/ToolConfirmationMessage.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/messages/ToolResultDisplay.tsx

- ✅ L82: "wrap"

### packages/cli/src/ui/components/messages/ToolShared.tsx

- ✅ L102: "truncate"
- ✅ L113: "truncate"

### packages/cli/src/ui/components/messages/UserMessage.tsx

- ✅ L39: "wrap"

### packages/cli/src/ui/components/messages/WarningMessage.tsx

- ✅ L26: "wrap"

### packages/cli/src/ui/components/shared/BaseSelectionList.tsx

- ✅ L23: "= SelectionListItem"
- ✅ L53: "= SelectionListItem"

### packages/cli/src/ui/components/shared/DescriptiveRadioButtonSelect.tsx

- ✅ L13: "extends SelectionListItem"

### packages/cli/src/ui/components/shared/ExpandableText.tsx

- ✅ L44: "\n"
- ✅ L62: "wrap"
- ✅ L118: "wrap"

### packages/cli/src/ui/components/shared/MaxSizedBox.tsx

- ✅ L118: "truncate"
- ✅ L134: "truncate"

### packages/cli/src/ui/components/shared/RadioButtonSelect.tsx

- ✅ L20: "extends SelectionListItem"
- ✅ L87: "truncate"
- ✅ L97: "truncate"

### packages/cli/src/ui/components/shared/ScopeSelector.tsx

- ✅ L42: "truncate"

### packages/cli/src/ui/components/shared/ScrollableList.tsx

- ✅ L38: "extends VirtualizedListProps"
- ✅ L42: "= VirtualizedListRef"

### packages/cli/src/ui/components/shared/text-buffer.ts

- ✅ L679: "= 0 && actualRow"
- ✅ L779: "= span.logStart && col"
- ✅ L1124: "= startColInLogical && logicalCol"

### packages/cli/src/ui/components/views/AgentsStatus.tsx

- ✅ L69: "0 && remoteAgents.length > 0 &&"

### packages/cli/src/ui/components/views/ExtensionsList.tsx

- ✅ L64: "cyan"
- ✅ L75: "gray"

### packages/cli/src/ui/components/views/HooksList.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/views/SkillsList.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/components/views/ToolsList.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/contexts/KeypressContext.tsx

- ✅ L377: "= '0' && ch"
- ✅ L432: "= '0' && ch"
- ✅ L444: "= '0' && ch"
- ✅ L454: "= '0' && ch"

### packages/cli/src/ui/contexts/ScrollProvider.tsx

- ✅ L209: "= hitTop && mouseEvent.row"

### packages/cli/src/ui/hooks/atCommandProcessor.ts

- ✅ L77: "text"
- ✅ L116: "atPath"
- ✅ L121: "text"
- ✅ L191: "@file.txt"
- ✅ L431: "\n"

### packages/cli/src/ui/hooks/keyToAnsi.ts

- ✅ L21: "= 'a' && key.name"

### packages/cli/src/ui/hooks/useConsoleMessages.ts

- ✅ L112: "log"

### packages/cli/src/ui/hooks/useGeminiStream.ts

- ✅ L767: "0 && remainingTokenCount"

### packages/cli/src/ui/hooks/useIncludeDirsTrust.tsx

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/hooks/useQuotaAndFallback.ts

- ✅ L83: "\n"
- ✅ L94: "\n"
- ✅ L101: "\n"

### packages/cli/src/ui/hooks/useSelectionList.ts

- ✅ L172: "= 0 && index"
- ✅ L410: "= 0 && targetIndex"

### packages/cli/src/ui/hooks/useShowMemoryCommand.ts

- ✅ 原扫描文案已不再出现在该文件（已改为 i18n 或移除）。

### packages/cli/src/ui/hooks/useSlashCompletion.ts

- ✅ L466: "new WeakMap"

### packages/cli/src/ui/hooks/useSnowfall.ts

- ✅ L152: "= 0 && flake.y"
- ✅ L152: "= 0 && flake.x"

### packages/cli/src/ui/themes/ansi-light.ts

- ✅ L85: "hljs-title"

### packages/cli/src/ui/themes/ansi.ts

- ✅ L86: "hljs-title"

### packages/cli/src/ui/themes/atom-one-dark.ts

- ✅ L93: "hljs-class .hljs-title"
- ✅ L136: "hljs-title"

### packages/cli/src/ui/themes/ayu-light.ts

- ✅ L73: "hljs-title"
- ✅ L83: "hljs-class .hljs-title"

### packages/cli/src/ui/themes/ayu.ts

- ✅ L64: "hljs-title"

### packages/cli/src/ui/themes/default-light.ts

- ✅ L47: "hljs-title"

### packages/cli/src/ui/themes/default.ts

- ✅ L66: "hljs-title"

### packages/cli/src/ui/themes/dracula.ts

- ✅ L68: "hljs-title"

### packages/cli/src/ui/themes/github-dark.ts

- ✅ L80: "hljs-title"
- ✅ L96: "hljs-class .hljs-title"

### packages/cli/src/ui/themes/github-light.ts

- ✅ L81: "hljs-title"
- ✅ L97: "hljs-class .hljs-title"

### packages/cli/src/ui/themes/googlecode.ts

- ✅ L55: "hljs-title"

### packages/cli/src/ui/themes/holiday.ts

- ✅ L86: "hljs-title"

### packages/cli/src/ui/themes/no-color.ts

- ✅ L87: "hljs-title"

### packages/cli/src/ui/themes/shades-of-purple.ts

- ✅ L57: "hljs-title"

### packages/cli/src/ui/themes/theme.ts

- ✅ L347: "hljs-title"
- ✅ L504: "0 && name.trim().length"

### packages/cli/src/ui/themes/xcode.ts

- ✅ L88: "hljs-title"
- ✅ L106: "hljs-class .hljs-title"

### packages/cli/src/ui/types.ts

- ✅ L45: "content"
- ✅ L220: "name"
- ✅ L220: "displayName"
- ✅ L220: "description"
- ✅ L220: "kind"

### packages/cli/src/ui/utils/CodeColorizer.tsx

- ✅ L195: "wrap"

### packages/cli/src/ui/utils/ConsolePatcher.ts

- ✅ L13: "id"

### packages/cli/src/ui/utils/InlineMarkdownRenderer.tsx

- ✅ L170: "node !== null)}"

### packages/cli/src/ui/utils/MarkdownDisplay.tsx

- ✅ L145: "wrap"
- ✅ L184: "wrap"
- ✅ L278: "wrap"
- ✅ L336: "generating more"
- ✅ L379: "\n"
- ✅ L429: "wrap"

### packages/cli/src/ui/utils/highlight.ts

- ✅ L36: "= transform.logStart && cursorCol"

### packages/cli/src/ui/utils/historyExportUtils.ts

- ✅ L78: "utf-8"

### packages/cli/src/ui/utils/markdownUtilities.ts

- ✅ L12: "safe"
- ✅ L106: "\n\n"

### packages/cli/src/ui/utils/rewindFileOps.ts

- ✅ L56: "user"
- ✅ L158: "Requested message to rewind to was not found "

### packages/cli/src/ui/utils/terminalSetup.ts

- ✅ L178: "utf8"

### packages/cli/src/ui/utils/textUtils.ts

- ✅ L112: "= 0x00 && code"
- ✅ L115: "= 0x80 && code"
- ✅ L138: "= 0x20 && code"

## 已使用 i18n 但仍有硬编码文案

### packages/cli/src/ui/commands/aboutCommand.ts

- ✅ L22: "commands:about.description"

### packages/cli/src/ui/commands/agentsCommand.ts

- ✅ L28: "message"
- ✅ L37: "message"
- ✅ L71: "message"
- ✅ L80: "message"
- ✅ L94: "message"
- ✅ L102: "message"
- ✅ L112: "message"
- ✅ L125: "message"
- ✅ L141: "message"
- ✅ L150: "message"
- ✅ L164: "message"
- ✅ L172: "message"
- ✅ L185: "message"
- ✅ L198: "message"
- ✅ L252: "message"
- ✅ L266: "message"
- ✅ L276: "commands:agents.description"

### packages/cli/src/ui/commands/authCommand.ts

- ✅ L20: "commands:auth.login.description"
- ✅ L33: "commands:auth.logout.description"
- ✅ L56: "commands:auth.description"

### packages/cli/src/ui/commands/bugCommand.ts

- ✅ L32: "commands:bug.description"
- ✅ L101:
  "https://github.com/google-gemini/gemini-cli/issues/new?template=bug_report.yml&title={title}&info={info}&problem={problem}"
- ✅ L109: "{title}"

### packages/cli/src/ui/commands/chatCommand.ts

- ✅ L75: "commands:chat.list.description"
- ✅ L94: "commands:chat.save.description"
- ✅ L102: "message"
- ✅ L133: "message"
- ✅ L144: "message"
- ✅ L152: "message"
- ✅ L164: "commands:chat.resume.description"
- ✅ L172: "message"
- ✅ L185: "message"
- ✅ L198: "message"
- ✅ L243: "commands:chat.delete.description"
- ✅ L251: "message"
- ✅ L263: "message"
- ✅ L269: "message"
- ✅ L286: "commands:chat.share.description"
- ✅ L300: "message"
- ✅ L309: "message"
- ✅ L322: "message"
- ✅ L331: "message"
- ✅ L338: "message"
- ✅ L349: "commands:chat.debug.description"
- ✅ L357: "message"
- ✅ L373: "message"
- ✅ L380: "message"
- ✅ L391: "commands:chat.description"

### packages/cli/src/ui/commands/clearCommand.ts

- ✅ L22: "commands:clear.description"

### packages/cli/src/ui/commands/compressCommand.ts

- ✅ L17: "commands:compress.description"

### packages/cli/src/ui/commands/copyCommand.ts

- ✅ L16: "commands:copy.description"
- ✅ L31: "message"
- ✅ L47: "message"
- ✅ L56: "message"
- ✅ L63: "message"

### packages/cli/src/ui/commands/directoryCommand.tsx

- ✅ L50: "commands:directory.errorRefreshingMemory"
- ✅ L73: "commands:directory.description"
- ✅ L80: "commands:directory.add.description"
- ✅ L122: "message"
- ✅ L124: "commands:directory.sandboxNotSupported"
- ✅ L205: "commands:directory.errorAdding"
- ✅ L246: "commands:directory.show.description"

### packages/cli/src/ui/commands/docsCommand.ts

- ✅ L20: "commands:docs.description"

### packages/cli/src/ui/commands/extensionsCommand.ts

- ✅ L598: "commands:extensions.list.description"
- ✅ L608: "commands:extensions.update.description"
- ✅ L619: "commands:extensions.disable.description"
- ✅ L630: "commands:extensions.enable.description"
- ✅ L641: "commands:extensions.install.description"
- ✅ L651: "commands:extensions.link.description"
- ✅ L661: "commands:extensions.uninstall.description"
- ✅ L672: "commands:extensions.explore.description"
- ✅ L682: "commands:extensions.restart.description"
- ✅ L705: "commands:extensions.description"

### packages/cli/src/ui/commands/helpCommand.ts

- ✅ L17: "commands:help.description"

### packages/cli/src/ui/commands/hooksCommand.ts

- ✅ L27: "message"
- ✅ L29: "commands:hooks.configNotLoaded"
- ✅ L54: "message"
- ✅ L56: "commands:hooks.configNotLoaded"
- ✅ L63: "message"
- ✅ L65: "commands:hooks.hookSystemNotEnabled"
- ✅ L72: "message"
- ✅ L74: "commands:hooks.usageEnable"
- ✅ L100: "message"
- ✅ L102: "commands:hooks.enabledSuccess"
- ✅ L106: "message"
- ✅ L108: "commands:hooks.failedToEnable"
- ✅ L123: "message"
- ✅ L125: "commands:hooks.configNotLoaded"
- ✅ L132: "message"
- ✅ L134: "commands:hooks.hookSystemNotEnabled"
- ✅ L141: "message"
- ✅ L143: "commands:hooks.usageDisable"
- ✅ L168: "message"
- ✅ L170: "commands:hooks.disabledSuccess"
- ✅ L174: "message"
- ✅ L176: "commands:hooks.failedToDisable"
- ✅ L215: "message"
- ✅ L217: "commands:hooks.configNotLoaded"
- ✅ L224: "message"
- ✅ L226: "commands:hooks.hookSystemNotEnabled"
- ✅ L235: "message"
- ✅ L237: "commands:hooks.noHooksConfigured"
- ✅ L244: "message"
- ✅ L246: "commands:hooks.allHooksEnabled"
- ✅ L265: "message"
- ✅ L267: "commands:hooks.enabledCount"
- ✅ L271: "message"
- ✅ L273: "commands:hooks.failedToEnableAll"
- ✅ L287: "message"
- ✅ L289: "commands:hooks.configNotLoaded"
- ✅ L296: "message"
- ✅ L298: "commands:hooks.hookSystemNotEnabled"
- ✅ L307: "message"
- ✅ L309: "commands:hooks.noHooksConfigured"
- ✅ L316: "message"
- ✅ L318: "commands:hooks.allHooksDisabled"
- ✅ L338: "message"
- ✅ L340: "commands:hooks.disabledCount"
- ✅ L344: "message"
- ✅ L346: "commands:hooks.failedToDisableAll"
- ✅ L355: "commands:hooks.panel.description"
- ✅ L364: "commands:hooks.enable.description"
- ✅ L375: "commands:hooks.disable.description"
- ✅ L387: "commands:hooks.enableAll.description"
- ✅ L398: "commands:hooks.disableAll.description"
- ✅ L408: "commands:hooks.description"

### packages/cli/src/ui/commands/mcpCommand.ts

- ✅ L31: "commands:mcp.auth.description"
- ✅ L44: "message"
- ✅ L46: "commands:mcp.configNotLoaded"
- ✅ L71: "message"
- ✅ L73: "commands:mcp.noOAuthServers"
- ✅ L78: "message"
- ✅ L80: "commands:mcp.oauthServersList"
- ✅ L80: "\n"
- ✅ L80: "commands:mcp.useAuthHint"
- ✅ L87: "message"
- ✅ L89: "commands:mcp.serverNotFound"
- ✅ L97: "info"
- ✅ L149: "message"
- ✅ L151: "commands:mcp.auth.refreshed"
- ✅ L155: "message"
- ✅ L157: "commands:mcp.auth.failed"
- ✅ L182: "message"
- ✅ L184: "commands:mcp.configNotLoaded"
- ✅ L191: "message"
- ✅ L193: "commands:tools.noRegistry"
- ✅ L283: "commands:mcp.list.description"
- ✅ L292: "description"
- ✅ L294: "commands:mcp.desc.description"
- ✅ L304: "commands:mcp.schema.description"
- ✅ L314: "commands:mcp.refresh.description"
- ✅ L324: "message"
- ✅ L326: "commands:mcp.configNotLoaded"
- ✅ L333: "message"
- ✅ L335: "commands:mcp.noClientManager"
- ✅ L362: "commands:mcp.description"

### packages/cli/src/ui/commands/memoryCommand.ts

- ✅ L21: "commands:memory.description"
- ✅ L29: "commands:memory.show.description"
- ✅ L50: "commands:memory.add.description"
- ✅ L57: "message"
- ✅ L64: "commands:memory.add.saving"
- ✅ L75: "commands:memory.refresh.description"
- ✅ L105: "commands:memory.refresh.error"
- ✅ L115: "commands:memory.list.description"

### packages/cli/src/ui/commands/modelCommand.ts

- ✅ L17: "commands:model.description"

### packages/cli/src/ui/commands/permissionsCommand.ts

- ✅ L22: "commands:permissions.description"
- ✅ L46: "message"
- ✅ L54: "message"
- ✅ L76: "message"
- ✅ L83: "message"

### packages/cli/src/ui/commands/privacyCommand.ts

- ✅ L14: "commands:privacy.description"

### packages/cli/src/ui/commands/quitCommand.ts

- ✅ L15: "commands:quit.description"

### packages/cli/src/ui/commands/rewindCommand.tsx

- ✅ L86: "commands:rewind.unknownError"
- ✅ L94: "commands:rewind.description"
- ✅ L101: "message"
- ✅ L103: "commands:rewind.noConfig"
- ✅ L109: "message"
- ✅ L111: "commands:rewind.noClient"
- ✅ L117: "message"
- ✅ L119: "commands:rewind.noRecording"
- ✅ L125: "message"
- ✅ L127: "commands:rewind.noConversation"
- ✅ L135: "message"
- ✅ L137: "commands:rewind.nothingToRewind"

### packages/cli/src/ui/commands/settingsCommand.ts

- ✅ L14: "commands:settings.description"

### packages/cli/src/ui/commands/skillsCommand.ts

- ✅ L244: "commands:skills.reloadFailed"
- ✅ L280: "commands:skills.description"
- ✅ L288: "commands:skills.list.description"
- ✅ L296: "commands:skills.disable.description"
- ✅ L305: "commands:skills.enable.description"
- ✅ L314: "commands:skills.reload.description"

### packages/cli/src/ui/commands/statsCommand.ts

- ✅ L49: "commands:stats.description"
- ✅ L60: "commands:stats.session.description"
- ✅ L71: "commands:stats.model.description"
- ✅ L84: "commands:stats.tools.description"

### packages/cli/src/ui/commands/themeCommand.ts

- ✅ L14: "commands:theme.description"

### packages/cli/src/ui/commands/toolsCommand.ts

- ✅ L18: "commands:tools.description"

### packages/cli/src/ui/components/AboutBox.tsx

- ✅ L46: "about.title"

### packages/cli/src/ui/components/ConfigInitDisplay.tsx

- ✅ L16: "dialogs:common.loading"

### packages/cli/src/ui/components/ConsentPrompt.tsx

- ✅ L46: "No"

### packages/cli/src/ui/components/ContextUsageDisplay.tsx

- ✅ L25: "footer.contextLeft"

### packages/cli/src/ui/components/ExitWarning.tsx

- ✅ L20: "exitWarning.ctrlC"
- ✅ L26: "exitWarning.ctrlD"

### packages/cli/src/ui/components/FolderTrustDialog.tsx

- ✅ L74: "folderTrust.trustFolder"
- ✅ L79: "folderTrust.trustParent"
- ✅ L84: "folderTrust.dontTrust"
- ✅ L102: "folderTrust.title"
- ✅ L105: "folderTrust.description"

### packages/cli/src/ui/components/Footer.tsx

- ✅ L123: "footer.untrusted"
- ✅ L126: "green"
- ✅ L140: "footer.seeDocs"

### packages/cli/src/ui/components/Help.tsx

- ✅ L82: "[MCP]"
- ✅ L108: "[MCP]"
- ✅ L108: "commands:help.sections.mcpNote"
- ✅ L108: "[MCP] - "

### packages/cli/src/ui/components/LoadingIndicator.tsx

- ✅ L74: "truncate-end"

### packages/cli/src/ui/components/LogoutConfirmationDialog.tsx

- ✅ L41: "logout.login"
- ✅ L46: "logout.exit"
- ✅ L65: "logout.title"
- ✅ L68: "logout.message"
- ✅ L76: "logout.helpText"

### packages/cli/src/ui/components/ModelDialog.tsx

- ✅ L89: "model.manualDescription"
- ✅ L200: "model.title"
- ✅ L229: "model.pressTabToToggle"
- ✅ L237: "model.pressEscToClose"

### packages/cli/src/ui/components/RawMarkdownIndicator.tsx

- ✅ L19: "rawMarkdown.toggle"

### packages/cli/src/ui/components/SettingsDialog.tsx

- ✅ L493: "Settings"
- ✅ L905: "settings"
- ✅ L905: "settings.title"
- ✅ L924: "settings.searchPlaceholder"
- ✅ L930: "settings.noMatchesFound"
- ✅ L1060: "truncate"
- ✅ L1097: "scope"
- ✅ L1097: "truncate"
- ✅ L1116: "settings.helpText"
- ✅ L1116: "settings.helpTextNoScope"

### packages/cli/src/ui/components/ShellModeIndicator.tsx

- ✅ L18: "shellMode.escToDisable"

### packages/cli/src/ui/components/StatusDisplay.tsx

- ✅ L35: "exitWarning.ctrlC"
- ✅ L45: "exitWarning.ctrlD"

### packages/cli/src/ui/components/ThemeDialog.tsx

- ✅ L296: "theme"
- ✅ L296: "truncate"
- ✅ L320: "truncate"
- ✅ L340: "truncate"
- ✅ L411: "truncate"
- ✅ L412: "theme"
- ✅ L412: "theme.helpText"
- ✅ L412: "theme.helpTextScope"

### packages/cli/src/ui/components/Tips.tsx

- ✅ L22: "gettingStarted.title"

### packages/cli/src/ui/components/views/ChatList.tsx

- ✅ L21: "chat.noCheckpoints"
- ✅ L26: "chat.listTitle"
- ✅ L46: "chat.newestLast"

### packages/cli/src/ui/components/views/McpStatus.tsx

- ✅ L54: "mcp.noServersConfigured"
- ✅ L79: "mcp.configuredServers"
- ✅ L154: "mcp.oauthExpired"
- ✅ L158: "mcp.oauthNotAuthenticated"
- ✅ L177: "mcp.toolsWillAppear"
- ✅ L180: "mcp.toolsCached"
- ✅ L191: "mcp.tools"
- ✅ L219: "mcp.parameters"
- ✅ L233: "mcp.prompts"
- ✅ L253: "mcp.resources"
- ✅ L257: "resource"
- ✅ L297: "mcp.blocked"

### packages/cli/src/ui/hooks/slashCommandProcessor.ts

- ✅ L406: "message"
- ✅ L604: "common:slashCommand.requiresSubcommand"

### packages/cli/src/ui/privacy/CloudFreePrivacyNotice.tsx

- ✅ L42: "dialogs:common.loading"
- ✅ L51: "privacy:common.pressEscToExit"
- ✅ L60: "privacy:codeAssist.title"
- ✅ L67: "privacy:common.pressEscToExit"
- ✅ L73: "dialogs:common.yes"
- ✅ L73: "true"
- ✅ L74: "dialogs:common.no"
- ✅ L74: "false"
- ✅ L80: "privacy:cloudFree.title"
- ✅ L85: "privacy:cloudFree.description2"

### packages/cli/src/ui/privacy/CloudPaidPrivacyNotice.tsx

- ✅ L32: "vertexAI.title"
- ✅ L36: "vertexAI.description1"
- ✅ L36: "vertexAI.description2"
- ✅ L37: "vertexAI.description3"
- ✅ L49: "common.pressEscToExit"

### packages/cli/src/ui/privacy/GeminiPrivacyNotice.tsx

- ✅ L30: "gemini.title"
- ✅ L34: "gemini.description1"
- ✅ L34: "gemini.description2"
- ✅ L35: "gemini.description3"
- ✅ L36: "gemini.description4"
- ✅ L56: "common.pressEscToExit"

### packages/cli/src/ui/utils/updateCheck.ts

- ✅ L79: "common:updateCheck.newVersionAvailable"
- ✅ L95: "common:updateCheck.updateAvailable"

## 文案常量（已改为按当前语言读取 i18n，保留英文兜底）

### packages/cli/src/ui/constants/tips.ts

- ✅ 已改为 `getInformativeTips()` 从 `phrases:tips.*`
  读取本地化文案；英文兜底来自 `packages/cli/src/i18n/locales/en/phrases.json`。
- ✅ 已确认 `packages/cli/src/i18n/locales/zh-CN/phrases.json` 提供中文翻译。

### packages/cli/src/ui/constants/wittyPhrases.ts

- ✅ 已改为 `getWittyLoadingPhrases()` 从 `phrases:wittyPhrases`
  读取本地化文案；英文兜底来自 `packages/cli/src/i18n/locales/en/phrases.json`。
- ✅ 已确认 `packages/cli/src/i18n/locales/zh-CN/phrases.json` 提供中文翻译。

### packages/cli/src/ui/textConstants.ts

- ✅ 已改为通过 `t('common:screenReader.*')` 与
  `t('common:redirectionWarning.*')` 读取本地化文案（含英文兜底）。
