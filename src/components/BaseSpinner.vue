<template>
  <div :class="['spinner-wrapper', {'active': isLoading}]">
    <div class="spinner"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isLoading: boolean,
}>()
</script>

<style lang="scss" scoped>
@import '@/assets/style/app.scss';

.spinner-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 10;
  background: #211c45;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 72px;

  .spinner {
    border: 6px solid #e3a422;
    border-top: 6px solid transparent;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
