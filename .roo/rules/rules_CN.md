# 代码质量规则

1. 测试覆盖率：

    - 在尝试完成之前，始终确保任何代码更改都有测试覆盖
    - 在提交更改前确保所有测试都通过

2. Lint规则：

    - 未经用户明确批准，切勿禁用任何lint规则

3. 样式指南：
    - 对新标记使用Tailwind CSS类而不是内联样式对象
    - 在Tailwind类中使用VSCode CSS变量之前，必须将其添加到webview-ui/src/index.css
    - 示例：使用`<div className="text-md text-vscode-descriptionForeground mb-2" />`而不是样式对象

# 添加新设置

要添加保持其状态的新设置，请按照cline_docs/settings.md中的步骤操作 