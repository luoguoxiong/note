<template>
  <div class="air-contraband">
    <div class="air-contraband-header">
      <div class="title">禁止寄递物品目录</div>
      <div class="icon-img" @click="handleShowPop">图例</div>
    </div>
    <div class="air-contraband__list" v-once>
      <div v-for="(item, i) in list" :key="i" class="air-contraband__list--item">
        <div class="air-contraband__list--title">第{{ i + 1 }}条 {{ item.title }}</div>
        <img :src="item.img" class="air-contraband__list--img" />
        <div class="air-contraband__list--text">{{ item.text }}</div>
      </div>
    </div>

    <BottomPopup
      v-model:show="showPop"
      title="违禁品图例"
      @onClose="showPop = false"
      class="air-contraband-popup"
      :showFooter="false"
      :style="{ height: '98%' }"
    >
      <div class="air-contraband-popup-icons__content">
        <div class="air-contraband-popup-icons__content__list" v-for="(item, index) in icons" :key="index">
          <img :src="item.img" alt="" />
          <span>{{ item.name }}</span>
        </div>
        <div class="air-contraband-popup-icons__content__tips">
          航空违禁品主要是指威胁航空飞行安全的物品，指在航空运输中，可能明显地危害人身健康、安全或对财产造成损害的物品或物质。违反规定、隐瞒寄送违禁品，轻则会导致快递时效延误，重则会导致退货、扣货、甚至罚款。
        </div>
      </div>
    </BottomPopup>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'

const showPop = ref(false)
const list = ref([
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_64833_!!1750301005758_1324_304.png',
    title: '枪支(含仿制品、主要零部件)弹药',
    text: '1)枪支（含仿制品、主要零部件）：如手枪、步枪、冲锋枪、防暴枪、气枪、猎枪、运动枪、麻醉注射枪、钢珠枪、催泪枪等。\n2)弹药（含仿制品）：如子弹、炸弹、手榴弹、火箭弹、照明弹、燃烧弹、烟幕（雾）弹、信号弹、催泪弹、毒气弹、地雷、手雷、炮弹、火药等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_31952_!!1750301080993_1324_348.png',
    title: '管制器具',
    text: '1)管制刀具：如匕首、三棱刮刀、带有自锁装置的弹簧刀(跳刀)、其他相类似的单刃、双刃、三棱尖刀等。 \n2)其他：如弩、催泪器、催泪枪、电击器等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_59938_!!1750301122378_1324_320.png',
    title: '爆炸物品',
    text: '1)爆破器材：如炸药、雷管、导火索、导爆索、爆破剂等。\n2)烟花爆竹：如烟花、鞭炮、摔炮、拉炮、砸炮、彩药弹等烟花爆竹及黑火药、烟火药、发令纸、引火线等。\n3)其他：如推进剂、发射药、硝化棉、电点火头等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_7855_!!1750301207952_1324_312.png',
    title: '压缩和液化气体及其容器',
    text: '1)易燃气体：如氢气、甲烷、乙烷、丁烷、天然气、液化石油气、乙烯、丙烯、乙炔、打火机等。\n2)有毒气体：如一氧化碳、一氧化氮、氯气等。\n3)易爆或者窒息、助燃气体：如压缩氧气、氮气、氦气、氖气、气雾剂等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_13885_!!1750301232040_1324_304.png',
    title: '易燃液体',
    text: '如：汽油、柴油、煤油、桐油、丙酮、乙醚、油漆、生漆、苯、酒精、松香油等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_89180_!!1750301256682_1324_304.png',
    title: '易燃固体、自燃物质、遇水易燃物',
    text: '1)易燃固体：如红磷、硫磺、铝粉、闪光粉、固体酒精、火柴、活性炭等。\n2)自燃物质：如黄磷、白磷、硝化纤维(含胶片)、钛粉等。\n3)遇水易燃物质：如金属钠、钾、锂、锌粉、镁粉、碳化钙(电石)、氰化钠、氰化钾等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_85061_!!1750301287448_1324_304.png',
    title: '氧化剂和过氧化物',
    text: '如高锰酸盐、高氯酸盐、氧化氢、过氧化钠、过氧化钾、过氧化铅、氯酸盐、溴酸盐、硝酸盐、双氧水等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_62740_!!1750301310620_1324_304.png',
    title: '毒性物质',
    text: '如砷、砒霜、汞化物、铊化物、氰化物、硒粉、苯酚、汞、剧毒农药等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_655_!!1750301333145_1324_304.png',
    title: '生化制品、传染性、感染性物质',
    text: '如病菌、炭疽、寄生虫、排泄物、医疗废弃物、尸骨、动物器官、肢体、未经硝制的兽皮、未经药制的兽骨等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_7579_!!1750301356996_1324_304.png',
    title: '放射性物质',
    text: '如铀、钴、镭、钚等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_5137_!!1750301518106_1324_304.png',
    title: '腐蚀性物质',
    text: '如硫酸、硝酸、盐酸、蓄电池、氢氧化钠、氢氧化钾等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_50928_!!1750301553776_1324_386.png',
    title: '毒品及吸毒工具、非正当用途麻醉药品和精神 药品、非正当用途的易制毒化学品',
    text: '1)毒品、麻醉药品和精神药品：如鸦片(包括罂粟壳、花、苞、叶)、吗啡、海洛因、可卡因、大麻、甲基苯丙胺(冰毒)、氯胺酮、甲卡西酮、苯丙胺、安钠咖等。\n2)易制毒化学品：如胡椒醛、黄樟素、黄樟油、麻黄素、伪麻黄素、羟亚胺、邻酮、苯乙酸、溴代苯丙酮、醋酸酐、甲苯、丙酮等。\n3)吸毒工具：如冰壶等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_57838_!!1750301575864_1324_304.png',
    title: '非法出版物、印刷品、音像制品等宣传品',
    text: '如含有反动、煽动民族仇恨、破坏国家统一、破坏社会稳定、宣扬邪教、宗教极端思想、淫秽等内容的图书、刊物、图片、照片、音像制品等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_90076_!!1750301606881_1324_308.png',
    title: '间谍专用器材',
    text: '如暗藏式窃听器材、窃照器材、突发式收发报机、一次性密码本、密写工具、用于获取情报的电子监听和截收器材等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_68121_!!1750301641211_1324_306.png',
    title: '非法伪造物品',
    text: '如伪造或者变造的货币、证件、公章等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_28221_!!1750301664337_1324_304.png',
    title: '侵犯知识产权和假冒伪劣物品',
    text: '1)侵犯知识产权：如侵犯专利权、商标权、著作权的图书、音像制品等。\n2)假冒伪劣：如假冒伪劣的食品、药品、儿童用品、电子产品、化妆品、纺织品等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_4257_!!1750301682391_1324_328.png',
    title: '濒危野生动物及其制品',
    text: '如象牙、虎骨、犀牛角及其制品等。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_97448_!!1750301708377_1324_326.png',
    title: '禁止进出境物品',
    text: '如有碍人畜健康的、来自疫区的以及其他能传播疾病的食品、药品或者其他物品；内容涉及国家秘密的文件、资料及其他物品。',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_65464_!!1750301729240_1324_304.png',
    title: '其他物品',
    text: '《危险化学品目录》 《民用爆炸物品品名表》 《易制爆危险化学品名录》 《易制毒化学品的分类和品种目录》 《中华人民共和国禁止进出境物品表》载明的物品和《人间传染的病原微生物名录》载明的第一、二类病原微生物等，以及法律、行政法规、国务院和国务院有关部门规定禁止寄递的其他物品。',
  },
])

const icons = ref([
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_60116_!!1750306057841_260_260.png',
    name: '枪支',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_18112_!!1750306025450_260_260.png',
    name: '管制器具',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_66860_!!1750306047526_260_260.png',
    name: '爆炸物品',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_69243_!!1750306022034_260_260.png',
    name: '压缩液化气体',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_82668_!!1750306051631_260_260.png',
    name: '易燃液体',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_80096_!!1750306054751_260_260.png',
    name: '易燃固体',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_4232_!!1750306077819_260_260.png',
    name: '氧化剂',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_8124_!!1750306368884_260_260.png',
    name: '毒性物质',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_46774_!!1750302586505_260_260.png',
    name: '生化制品',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_33079_!!1750306362201_260_260.png',
    name: '放射性物质',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_71763_!!1750306028485_260_260.png',
    name: '腐蚀性物质',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_57391_!!1750306034764_260_260.png',
    name: '毒品及吸毒工具',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_26890_!!1750306065096_260_260.png',
    name: '非法出版物',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_78996_!!1750306043176_260_260.png',
    name: '间谍专用器材',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_12092_!!1750306061553_260_260.png',
    name: '非法伪造物品',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_16980_!!1750306068406_260_260.png',
    name: '侵犯知识产权',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_73186_!!1750306038488_260_260.png',
    name: '濒危野生动物',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_90168_!!1750306083883_260_260.png',
    name: '禁止进出境物品',
  },
  {
    img: 'https://ic-img.ky-express.com/netc/20250619_13039_!!1750306074757_260_260.png',
    name: '其他物品',
  },
])
const handleShowPop = () => {
  showPop.value = true
}
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
