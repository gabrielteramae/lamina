# lamina — barbearia com agenda e pagamento

![Node](https://img.shields.io/badge/Node-22+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)

Barbearia de cadeira marcada, no navegador. O cliente escolhe serviço, profissional e horário e fecha com **Pix**, **cartão** ou **na cadeira**. A equipe confirma, conclui, cancela e registra o recebimento.

Nada é cobrado de verdade. Pix e cartão são simulação. A agenda fica **só neste navegador** (`localStorage`). Não há conta nem banco.

## O que dá para fazer

| Peça | Faz |
|---|---|
| Site | Carta de serviços, expediente e próximo horário livre. |
| Agendar | Cinco passos: serviço, profissional, horário, dados e pagamento. |
| Reserva | Código de 6 letras, comprovante e confirmação do Pix ou do cartão. |
| Equipe | Painel do dia, agenda com busca, livro-caixa, preços e expediente. |

Cartão de teste: `4242 4242 4242 4242` aprova. `4000 0000 0000 0002` é recusado. O número completo não é guardado — só a bandeira e os 4 últimos dígitos.

## Stack

- **React 19**, **TanStack Start / Router**, **Vite**
- **Tailwind CSS 4**, **Zustand** (persistência local)
- **Recharts** no painel da semana
- Validação de cartão com Luhn, no cliente

## Estrutura

```
lamina/
├── src/
│   ├── routes/              # páginas: site, reserva e /equipe
│   ├── components/          # agenda, pagamento e painel
│   └── lib/shop/            # carta, horários, pagamento e reservas
├── src/lib/shop/pay.test.ts # Luhn, recusa e conflito de horário
└── package.json
```

## Como rodar

```bash
git clone https://github.com/gabrielteramae/lamina.git
cd lamina
npm install
npm run dev
```

Abre `http://127.0.0.1:8080`.

Na amostra já existem reservas. O painel da equipe fica em `/equipe`. Em Expediente dá para restaurar os dados de exemplo.

## Testes realizados

`src/lib/shop/pay.test.ts` não chama rede. Cobre o cartão de demonstração (Luhn), a recusa do número terminado em `0002`, e o bloqueio de horário só para o profissional ocupado.

```bash
node --experimental-strip-types --test src/lib/shop/pay.test.ts
```

Não há suíte de ponta a ponta do clique na agenda.

---

© 2026 Gabriel Teramae Chan
