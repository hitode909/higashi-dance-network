export type Cloth = 'halfshirts' | 'shirts' | 'cardigan' | 'sweater' | 'jacket' | 'coat' | 'muffler' | 'umbrella';

export interface ClothSet {
  min: number;
  max: number;
  daytime: Cloth[];
  night: Cloth[];
  comment: string;
};

export const ClothRules: ClothSet[] =[
    // エラー対策
    {
      min: 100,
      max: 100,
      daytime: ['halfshirts'],

      night: ['halfshirts'],

      comment: '異常な暑さです',
    },

    {
      min: 50,
      max: 50,
      daytime: ['halfshirts'],

      night: ['halfshirts'],

      comment: '暑いので半袖で出かけましょう',
    },

    {
      min: 35,
      max: 35,
      daytime: ['shirts'],

      night: ['shirts'],

      comment: '暖かくていい天気なのでシャツ一枚で大丈夫です',
    },

    {
      min: 34,
      max: 34,
      daytime: ['shirts'],

      night: ['shirts', 'cardigan'],

      comment: '昼は暑く夜はカーディガンがあればいいくらいです',
    },

    {
      min: 15,
      max: 25,
      daytime: ['shirts'],

      night: ['shirts', 'jacket'],

      comment: '少し冷えるのでジャケットを着ましょう',
    },

    {
      min: 10,
      max: 25,
      daytime: ['shirts'],

      night: ['shirts', 'cardigan', 'jacket'],

      comment: '冷えるのでカーディガンとジャケットを着ましょう',
    },

    {
      min: 7,
      max: 25,
      daytime: ['shirts'],

      night: ['shirts', 'cardigan', 'coat'],

      comment: '冷えるのでカーディガンとコートを着ましょう',
    },

    {
      min: 5,
      max: 25,
      daytime: ['shirts'],

      night: ['shirts', 'cardigan', 'coat', 'muffler'],

      comment: 'すごく冷えるのでカーディガンとコートとマフラーを着ましょう',
    },

    {
      min: 18,
      max: 18,
      daytime: ['shirts', 'cardigan'],

      night: ['shirts', 'cardigan'],

      comment: '一日肌寒いのでカーディガンです',
    },

    {
      min: 15,
      max: 18,
      daytime: ['shirts', 'jacket'],

      night: ['shirts', 'jacket'],

      comment: '朝晩冷えるので一日ジャケットです',
    },

    {
      min: 10,
      max: 18,
      daytime: ['shirts', 'cardigan'],

      night: ['shirts', 'cardigan', 'jacket'],

      comment: 'カーディガンにジャケットを羽織ります',
    },

    {
      min: 7,
      max: 18,
      daytime: ['shirts', 'cardigan'],

      night: ['shirts', 'cardigan', 'coat'],

      comment: 'カーディガンにコートを羽織ります',
    },

    {
      min: 5,
      max: 18,
      daytime: ['shirts', 'cardigan'],

      night: ['shirts', 'cardigan', 'coat', 'muffler'],

      comment: '夜は寒いのでコートにマフラーがいいです',
    },

    {
      min: 14,
      max: 14,
      daytime: ['shirts', 'sweater'],

      night: ['shirts', 'sweater'],

      comment: '一日冷えるのでセーターです',
    },

    {
      min: 10,
      max: 14,
      daytime: ['shirts', 'sweater'],

      night: ['shirts', 'sweater', 'jacket'],

      comment: 'セーターにジャケットを羽織ります',
    },

    {
      min: 7,
      max: 14,
      daytime: ['shirts', 'sweater'],

      night: ['shirts', 'sweater', 'coat'],

      comment: 'もこもこセーターにコート羽織って出かけましょう',
    },

    {
      min: 5,
      max: 14,
      daytime: ['shirts', 'sweater'],

      night: ['shirts', 'sweater', 'coat', 'muffler'],

      comment: '夜は冷え込むのでたくさん着ていきましょう',
    },

    {
      min: 12,
      max: 12,
      daytime: ['shirts', 'cardigan', 'coat'],

      night: ['shirts', 'cardigan', 'coat'],

      comment: '一日少し寒いのでカーディガンとコートを着ましょう',
    },

    {
      min: 8,
      max: 12,
      daytime: ['shirts', 'sweater', 'coat'],

      night: ['shirts', 'sweater', 'coat'],

      comment: '一日寒いのでセータとコートを着ましょう',
    },

    {
      min: 5,
      max: 12,
      daytime: ['shirts', 'sweater', 'coat'],

      night: ['shirts', 'sweater', 'coat', 'muffler'],

      comment: '一日寒いので昼でもコート夜はマフラーです',
    },

    {
      min: 5,
      max: 5,
      daytime: ['shirts', 'sweater', 'coat', 'muffler'],

      night: ['shirts', 'sweater', 'coat', 'muffler'],

      comment: 'すごく寒いので一日マフラーが手放せません',
    },
  ];