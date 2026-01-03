
import { Category, Bookmark } from './types';

export const CATEGORIES: Category[] = [
  { id: 'tools', name: '实用工具', iconType: 'tools' },
  { id: 'media', name: '影音编辑', iconType: 'media' },
  { id: 'resources', name: '资源站点', iconType: 'resources' },
  { id: 'misc', name: '其它常用', iconType: 'misc' },
];

export const INITIAL_BOOKMARKS: Bookmark[] = [
  // 实用工具
  { id: '1', categoryId: 'tools', name: 'Google', url: 'https://www.google.com', description: '全球领先的搜索引擎', icon: 'https://www.google.com/favicon.ico' },
  { id: '2', categoryId: 'tools', name: 'DeepL', url: 'https://www.deepl.com', description: '全世界最准确的文本翻译工具', icon: 'https://www.deepl.com/favicon.ico' },
  { id: '3', categoryId: 'tools', name: 'TinyPNG', url: 'https://tinypng.com', description: '智能压缩您的 WebP、PNG 和 JPEG 图片', icon: 'https://tinypng.com/images/favicon.ico' },
  { id: '4', categoryId: 'tools', name: 'ProcessOn', url: 'https://www.processon.com', description: '免费在线流程图思维导图', icon: 'https://www.processon.com/favicon.ico' },
  
  // 影音编辑
  { id: '5', categoryId: 'media', name: 'Bilibili', url: 'https://www.bilibili.com', description: '中国领先的年轻人文化社区', icon: 'https://www.bilibili.com/favicon.ico' },
  { id: '6', categoryId: 'media', name: 'Canva 可画', url: 'https://www.canva.cn', description: '零门槛的在线图形设计平台', icon: 'https://www.canva.cn/favicon.ico' },
  { id: '7', categoryId: 'media', name: 'YouTube', url: 'https://www.youtube.com', description: '全球最大的视频分享平台', icon: 'https://www.youtube.com/favicon.ico' },
  { id: '8', categoryId: 'media', name: '剪映', url: 'https://www.capcut.cn', description: '全能易用的视频编辑工具', icon: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptp_j_l_jvwzlp/capcut/favicon.ico' },

  // 资源站点
  { id: '9', categoryId: 'resources', name: 'Pixabay', url: 'https://pixabay.com', description: '百万级免费高清图片、素材下载', icon: 'https://pixabay.com/favicon-32x32.png' },
  { id: '10', categoryId: 'resources', name: 'GitHub', url: 'https://github.com', description: '全球开源代码托管与资源平台', icon: 'https://github.githubassets.com/favicons/favicon.svg' },
  { id: '11', categoryId: 'resources', name: 'iconfont', url: 'https://www.iconfont.cn', description: '阿里巴巴矢量图标库', icon: 'https://gtms04.alicdn.com/tps/i4/TB1_oz6GVXXXXaFXpXXJ6TrIXXX-32-32.ico' },
  
  // 其它常用
  { id: '12', categoryId: 'misc', name: '知乎', url: 'https://www.zhihu.com', description: '中文互联网高质量问答社区', icon: 'https://static.zhihu.com/heifetz/favicon.ico' },
  { id: '13', categoryId: 'misc', name: '豆瓣', url: 'https://www.douban.com', description: '提供书影音推荐、线下活动、小组等服务', icon: 'https://www.douban.com/favicon.ico' },
  { id: '14', categoryId: 'misc', name: '京东', url: 'https://www.jd.com', description: '综合网络零售商，正品保障', icon: 'https://www.jd.com/favicon.ico' },
];
