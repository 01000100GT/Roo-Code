## 运行数据库迁移

根据需要更新 `src/schema.ts`，然后运行：

```sh
pnpm db:generate
```

检查添加到 `drizzle/` 目录的迁移文件中的 SQL 语句。

如果看起来没问题，则运行：

```sh
pnpm db:migrate
```