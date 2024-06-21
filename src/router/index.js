import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),  // 主要是hash模式
  routes: [
    {
      // 软件主界面
      path: "/",
      component: () => import("@/views/LayOutContainer.vue"), // 使用箭头函数可以懒加载
      redirect: "/homePage",
      children: [
        {
          path: "/homePage",
          component: () => import("@/views/layOutContainer/HomePage.vue"),
        },
        { 
          path: "/comingSoon", component: () => import("@/views/ComingSoon.vue") 
        },
    
        {
          path: "/qualityInspection",
          component: () => import("@/views/layOutContainer/QualityInspection.vue"),
          redirect: "/qualityInspection/overview",
          children: [
            {
              path: "/qualityInspection/overview",
              component: () => import("@/views/layOutContainer/qualityInspection/Overview.vue"),
            },
            {
              path: "/qualityInspection/summary",
              component: () => import("@/views/layOutContainer/qualityInspection/Summary.vue"),
            },
            {
              path: "/qualityInspection/tableDetect",
              component: () => import("@/views/layOutContainer/qualityInspection/TableDetect.vue"),
            },
            {
              path: "/qualityInspection/distributionDetect",
              component: () => import("@/views/layOutContainer/qualityInspection/DistributionDetect.vue"),
            },
          ],
        },
        {
          path: "/databaseSettings",
          component: () => import("@/views/layOutContainer/DatabaseSettings.vue"),
        },
      ],
    },
  ],
});

export default router;
