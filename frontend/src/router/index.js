import { createRouter, createWebHistory } from 'vue-router';
import InstancesView from '../views/InstancesView.vue';

const routes = [
  {
    path: '/',
    name: 'instances',
    component: InstancesView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 