import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    mode:'history',
    base: '/admin/',
    routes: [
        {
            path: '/',
            redirect: '/home'
        },
        {
            path: '/', 
            component: resolve => require(['../components/common/Home.vue'], resolve),
            meta: { title: '自述文件' },
            children:[{
                    path: '/home',
                    component: resolve => require(['../components/pages/Home.vue'], resolve),
                    meta: { title: '首页' }
                },{
                    path: '/news',
                    component: resolve => require(['../components/pages/News.vue'], resolve),
                    meta: { title: '新闻动态' }
                },{
                    path: '/newsDetail',
                    component: resolve => require(['../components/pages/NewsDetail.vue'], resolve),
                    meta: { title: '新闻详情' }
                },{
                    path: '/addNews',
                    component: resolve => require(['../components/pages/AddNews.vue'], resolve),
                    meta: { title: '添加新闻' }
                },{
                    path: '/signup',
                    component: resolve => require(['../components/pages/Signup.vue'], resolve),
                    meta: { title: '赛事报名' }
                },{
                    path: '/addSignup',
                    component: resolve => require(['../components/pages/AddSignup.vue'], resolve),
                    meta: {title: '添加赛事报名'}
                },{
                    path: '/signupDetail',
                    component: resolve => require(['../components/pages/SignupDetail.vue'], resolve),
                    meta: {title: '赛事报名详情'}
                },{
                    path: '/rule',
                    component: resolve => require(['../components/pages/Rule.vue'], resolve),
                    meta: { title: '比赛规则' }
                },{
                    path: '/addRule',
                    component: resolve => require(['../components/pages/AddRule.vue'], resolve),
                    meta: { title: '添加比赛规则'}
                },{
                    path: '/ruleDetail',
                    component: resolve => require(['../components/pages/RuleDetail.vue'], resolve),
                    meta: { title: '比赛规则详情'}
                },{
                    path: '/competition',
                    component: resolve => require(['../components/pages/Competition.vue'], resolve),
                    meta: { title: '竞赛活动'}
                },{
                    path: '/competitionItem',
                    component: resolve => require(['../components/pages/CompetitionItem.vue'], resolve),
                    meta: { title: '竞赛活动项目'}
                },{
                    path: '/comItemRule',
                    component: resolve => require(['../components/pages/ComItemRule.vue'], resolve),
                    meta: { title: '比赛规则'}
                },{
                    path: '/comItemVideo',
                    component: resolve => require(['../components/pages/ComItemVideo.vue'], resolve),
                    meta: { title: '比赛视频'}
                },{
                    path: '/enterName',
                    component: resolve => require(['../components/pages/EnterName.vue'], resolve),
                    meta: { title: '报名信息'}
                },{
                    path: '/export',
                    component: resolve => require(['../components/pages/Export.vue'], resolve),
                    meta: { title: '专家'}
                },{
                    path: '/addExport',
                    component: resolve => require(['../components/pages/AddExport.vue'], resolve),
                    meta: { title: '添加专家'}
                },{
                    path: '/exportDetail',
                    component: resolve => require(['../components/pages/ExportDetail.vue'], resolve),
                    meta: { title: '修改专家信息'}
                },{
                    path: '/referee',
                    component: resolve => require(['../components/pages/Referee.vue'], resolve),
                    meta: { title: '裁判'}
                },{
                    path: '/addReferee',
                    component: resolve => require(['../components/pages/AddReferee.vue'], resolve),
                    meta: { title: '添加裁判'}
                },{
                    path: '/player',
                    component: resolve => require(['../components/pages/Player.vue'], resolve),
                    meta: { title: '选手'}
                },{
                    path: '/addPlayer',
                    component: resolve => require(['../components/pages/AddPlayer.vue'], resolve),
                    meta: { title: '添加选手'}
                },{
                    path: '/dashboard',
                    component: resolve => require(['../components/page/Dashboard.vue'], resolve),
                    meta: { title: '系统首页' }
                },{
                    path: '/icon',
                    component: resolve => require(['../components/page/Icon.vue'], resolve),
                    meta: { title: '自定义图标' }
                },{
                    path: '/table',
                    component: resolve => require(['../components/page/BaseTable.vue'], resolve),
                    meta: { title: '基础表格' }
                },{
                    path: '/tabs',
                    component: resolve => require(['../components/page/Tabs.vue'], resolve),
                    meta: { title: 'tab选项卡' }
                },{
                    path: '/form',
                    component: resolve => require(['../components/page/BaseForm.vue'], resolve),
                    meta: { title: '基本表单' }
                },{
                    // 富文本编辑器组件
                    path: '/editor',
                    component: resolve => require(['../components/page/VueEditor.vue'], resolve),
                    meta: { title: '富文本编辑器' }
                },{
                    // markdown组件
                    path: '/markdown',
                    component: resolve => require(['../components/page/Markdown.vue'], resolve),
                    meta: { title: 'markdown编辑器' }    
                },{
                    // 图片上传组件
                    path: '/upload',
                    component: resolve => require(['../components/page/Upload.vue'], resolve),
                    meta: { title: '文件上传' }   
                },{
                    // vue-schart组件
                    path: '/charts',
                    component: resolve => require(['../components/page/BaseCharts.vue'], resolve),
                    meta: { title: 'schart图表' }
                },{
                    // 拖拽列表组件
                    path: '/drag',
                    component: resolve => require(['../components/page/DragList.vue'], resolve),
                    meta: { title: '拖拽列表' }
                },{
                    // 权限页面
                    path: '/permission',
                    component: resolve => require(['../components/page/Permission.vue'], resolve),
                    meta: { title: '权限测试', permission: true }
                },{
                    path: '/404',
                    component: resolve => require(['../components/page/404.vue'], resolve),
                    meta: { title: '404' }
                },{
                    path: '/403',
                    component: resolve => require(['../components/page/403.vue'], resolve),
                    meta: { title: '403' }
                }
            ]
        },{
            path: '/login',
            component: resolve => require(['../components/pages/Login.vue'], resolve)
        },{
            path: '/registered',
            component: resolve => require(['../components/page/Registered.vue'], resolve)
        },{
            path: '*',
            redirect: '/404'
        }
    ]
})
