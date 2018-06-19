export default {
  HELLO: 'hello {name}',
  buy: 'Buy',
  sell: 'Sell',
  amount: 'amount',
  askUsingCreditCard: 'for {total} {fiatCurrency} using card?',
  change: 'Change',
  ccNumber: 'Number',
  ccExpire: 'Expiry',
  ccCVC: 'CVC',
  overCCLimit: 'Your limit is {currency}{limit}. You have already used {currency}{amount} ',

  required: 'Required',
  ccExpireTemplate: 'MM/YY',
  securityCode: '325',
  shakeNow: 'Shake',
  offerHandShakeContent: '{offerType} {amount} {currency} for {total} {currency_symbol} in {payment_method}?',
  offerHandShakeContentMe: '{offerType} {amount} {currency} for {total} {currency_symbol} ({payment_method})',
  offerHandShakeContentMeDone: '{offerType} {amount} {currency} for {total} {currency_symbol} ({payment_method})',
  instantOfferHandShakeContent: 'You{just}{offerType} {amount} {currency} for {total} {currency_symbol} on your card - fee {fee}%',
  offerDistanceContent: '{distance} away',
  transactonOfferInfo: 'Successful ({success}) / Failed ({failed})',
  createOfferConfirm: 'You are about to {type} {amount} {currency} for {total} {currency_symbol}',
  handshakeOfferConfirm: 'You are about to {type} {amount} {currency} for {total} {currency_symbol}',
  rejectOfferConfirm: 'Do you want to Reject this handshake? You will not be able to make transactions for 4 hours.',
  completeOfferConfirm: 'Do you want to Complete this handshake?',
  withdrawOfferConfirm: 'Do you want to Withdraw this handshake?',
  cancelOfferConfirm: 'Do you want to Cancel this handshake?',
  closeOfferConfirm: 'Do you want to Close this handshake?',
  acceptOfferConfirm: 'Do you want to Accept this handshake?',
  createOfferSuccessMessage: 'Create offer success',
  shakeOfferSuccessMessage: 'Shake offer success',
  closeOfferSuccessMessage: 'Close offer success',
  completeShakedfferSuccessMessage: 'Complete shaked offer success',
  cancelShakedfferSuccessMessage: 'Cancel shaked offer success',
  withdrawShakedfferSuccessMessage: 'Withdraw shaked offer success',
  buyUsingCreditCardSuccessMessge: 'Buy using Card success',
  notEnoughCoinInWallet: 'You only have {amount}({currency}) in default wallet {currency}. Fee ~ {fee}({currency}). Please add more',

  createOfferStoreConfirm: 'Do you want to create offer Buy {amountBuy} {currency} - Sell {amountSell} {currency}?',
  notEnoughCoinInWalletStores: 'You only have {amount}({currency}) in default wallet {currency}. Fee ~ {fee}({currency}). Please add more',
  addOfferItemSuccessMassage: 'Add offer item success',
  deleteOfferItemSuccessMassage: 'Delete offer item success',
  shakeOfferItemSuccessMassage: 'Shake offer item success',
  acceptOfferItemSuccessMassage: 'Accept offer item success',
  cancelOfferItemSuccessMassage: 'Cancel offer item success',
  rejectOfferItemSuccessMassage: 'Reject offer item success',
  completeOfferItemSuccessMassage: 'Complete offer item success',
  offerStoresAlreadyCreated: 'You have already create offer',
  offerStoreHandShakeContent: '{offerTypeBuy} {amountBuy} {currency} at {fiatAmountBuy} {fiatAmountCurrency}. {offerTypeSell} {amountSell} {currency} at {fiatAmountSell} {fiatAmountCurrency}',

  // FAQ
  FAQ_TITLE: '常见问题',
  FAQ_HEADER_YELLOW: '',
  FAQ_HEADER: '分散式预测交换',
  FAQ_DATA: [
    {
      question: '什么是忍者 PEX？',
      answer: '忍者是一个匿名的对等分散预测交换运行在虚灵议会 blockchain 顶部',
    },
    {
      question: 'PEX 有什么特别之处在？我为什么要赌一把？',
      answer: '它允许各方直接下注, 而不经过中央主管机构或庄家。这使得它100% 匿名, 没有任何迹象显示不需要下载。投注的管理和奖金的结算由 blockchain 网络集体进行, 保护用户免受任何单一故障点的侵害。您还可以创建自己的预测市场。',
    },
    {
      question: '我需要以太吗？它支持其他 cryptocurrencies 吗？',
      answer: '是的。忍者只接受了现在, 但支持将增加其他货币很快。',
    },
    {
      question: '如何从忍者开始？',
      isList: true,
      answer: [
        {
          title: '获取醚:',
          content: '您可以购买直接在 PEX 与您的信用卡或像 Coinbase 或 Binance 的流行硬币交易所。',
        },
        {
          title: '把你的 PEX 钱包顶起来:',
          content: '把 PEX 的钱包转给他PEX 钱包是完全分散的, 私钥是持有在您的手机上, 只有您可以转让和接收的瑞士联邦。',
        },
        {
          title: '下注:',
          content: '选择你想赌的市场 (即巴西-西班牙), 结果 (即巴西获胜) 和网站 (即支持或押注结果)\n' +
          '输入你要押注的赌注 (即 1) 和赔率 (即 1/2.25)\n' +
          '然后, 贝克斯匹配引擎将找到另一项命令, 对您设置的赔率进行下注。',
        },
        {
          title: '等待报告:',
          content: '如果你赢了, 你的奖金将自动从代管智能合同转移到您的帐户。',
        },
      ],
    },
    {
      question: '我可以设定自己的首选赔率吗？怎样？',
      answer: '是的！在创建自己的赌注时, 您将输入您感兴趣的事件以及要押注的结果。然后, 只需输入你的股份和你想要的赔率。然后, PEX 引擎将自动找到并匹配您与任何有兴趣在同一事件, 谁接受你的赔率。',
    },
    {
      question: '你如何进行警察的不体面/非法投注？',
      answer: '我们目前正在建立一个制衡系统, 以在 dojo 中标记不适当的行为。',
    },
    {
      question: '系统如何知道人们之间投注的结果？谁担任仲裁员, 并在合同签订时核实一个结果与另一结局？',
      answer: '忍者将很快有一个完全分散的解决方案, 以验证结果和激励真相告诉 (一刀记者!)。与此同时, 我们将会及时推出国际足联世界杯, 我们的团队将使用一个公开的消息来源 (livescore.com), 并担任记者。',
    },
    {
      question: '硬币在哪里举行？',
      answer: '没有人持有这些资金。所有的资金都保持在代管安全, 直到达成决议。',
    },
    {
      question: '为什么我要押注 blockchain 而不是使用传统的方法？',
      answer: '一个分散的预测交换将为您提供自由创建您自己的赔率和赌注直接与任何人, 提供您100% 忍者匿名和保证支付。',
    },
    {
      question: '隐私和匿名如何？',
      answer: '忍者不需要下载, 也没有签名 ups。这意味着没有密码, 没有电话号码, 也没有电子邮件。100% 匿名。',
    },
    {
      question: '我是否需要支付任何费用？',
      answer: '有两种主要的收费类型: 创建者费用 (用于创建赌注的忍者) 和网络费用 (创建者费用的百分比, 用于维护平台)。',
    },
    {
      question: '在最后定稿时, 我需要做些什么？',
      answer: '什么。如果你赢了, 你的奖金将自动转移到你的帐户。如果你输了, 那将是别人的帐户。',
    },
    {
      question: '在哪里可以找到匹配的赌注？',
      answer: '在主页上, 您可以浏览正在进行的投注和市场。如果你找不到任何你喜欢的, 创建自己的!',
    },
    {
      question: '除了运动之外, 我还能打赌别的什么吗？它是如何工作的？',
      answer: '很快, 忍者将适用于一切在阳光下。唯一的限制将是你的创造力。你可以很容易地创造任何未来的活动市场, 无论是体育, 政治, 科学, 市场, 气候... 你的名字。',
    },
    {
      question: '握手移动应用程序会发生什么情况？',
      answer: '我们将整合握手 (和您最喜欢的功能, 如承诺, 欠条, 合同上传等) 到忍者移动网站。',
    },
  ],

  // MobileOrTablet components
  MOT_TITLE: '匿名交换任何东西',
  MOT_CONTENT_0: '忍者网络只能通过移动访问',
  MOT_CONTENT_1: '在移动浏览器上打开',
  MOT_CONTENT_2: '以获取匿名输入。',
  MOT_CONTENT_3: '不需要下载。不需要注册。',
  MOT_LIST_CONTENT: [
    {
      mainContent: '阅读',
      placeHolderLink: '白皮',
      link: 'https://medium.com/@ninjadotorg/shakeninja-bex-1c938f18b3e8',
      mainContent1: '书',
      isBlankTarget: true,
    },
    {
      mainContent: '我们回答您的',
      placeHolderLink: '常见问题',
      link: '/faq',
    },
    {
      mainContent: '通过',
      placeHolderLink: '电报',
      link: 'https://t.me/ninja_org',
      isBlankTarget: true,
      mainContent1: '加入 dojo',
    },
  ],
};
