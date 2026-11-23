# Traction Finance

Painel financeiro pessoal. Uma página só, sem dependências de build.

- **Site:** https://vanzoick.github.io/traction-finance/
- **Contas:** Firebase Authentication (e-mail e senha)
- **Dados:** Cloud Firestore, em `usuarios/<id>/painel/dados/`

Cada conta só alcança o próprio caminho, e só se o e-mail estiver na coleção
`convites`. Quem garante isso é o `firestore.rules` — não o código da página,
que roda no navegador de quem acessa e pode ser alterado por qualquer um.

As chaves do Firebase no `index.html` são públicas por desenho: elas
identificam o projeto, não autorizam nada. A autorização vem das regras.

## Beta fechado

Para liberar alguém, crie um documento na coleção `convites` do Firestore
com o **e-mail em minúsculas como id**. Para revogar, apague o documento.
