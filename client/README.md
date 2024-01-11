TODO:あとでREADMEを更新する

# ブラウザ上でローカルのコードを動かす
```bash
$ npm start
```

---
# ディレクトリ構成
```
├── index.html
├── src
│   ├── App.tsx → Reactのエントリポイント(多分)
│   ├── assets → アイコンや画像、フォントファイル
│   ├── components 
│   │   ├── container → Presentational Componentを包含してロジックを持たせるコンポーネント(Container Component)
│   │   └── presenter → 見た目だけに責務を持たせるコンポーネント(Presentational Component)
│   ├── domains → [予定]ビジネスロジックや型定義用
│   ├── features → [予定]各機能ごとのディレクトリ
|   |   └── [awesome]
│   │       ├── container
│   │       └── presenter
│   ├── main.tsx
│   ├── routes → [予定]ルーティング用
│   ├── stores → [予定]Redux用
│   └── utils → [予定]汎用的に使える関数
├── tsconfig.json → TypeScriptの設定ファイル
├── vite.config.mts → Viteの設定ファイル
└── yarn.lock
```
