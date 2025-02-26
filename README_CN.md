## Local Setup & Development

1. **切换node版本**:
```bash
nvm use v20.10.0
```
2. **安装依赖**:
```bash
    npm run install:all
```
3. **启动webview的HMR热更服务**:
    ```bash
    npm run dev
    ```
4. **Debug**:
    - 按F5调试
    - 如果修改了webview-ui目录下的文件，需要再执行npm run build:webview才能生效

5. **git首次提交到github**:
```bash
    git branch chinese
    git checkout chinese
    git add .
    git commit -n -m '汉化' # -n参数 暂时忽略 Husky 的 pre - commit 钩子
    git push --set-upstream origin chinese
```