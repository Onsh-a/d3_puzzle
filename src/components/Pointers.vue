<template>
  <div class="pointers">
    <div class="pointer">
      <div class="pointer__info">
        <h3 class="pointer__title">
          Скорость
        </h3>
        <span class="pointer__data">
          {{ speed }} пкс/с
        </span>
      </div>
    </div>
    <div class="pointer">
      <div class="pointer__info">
        <h3 class="pointer__title">
          Раскрыто
        </h3>
        <span class="pointer__data">
          {{ coverage }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  speed?: string | number
  coverage?: string | number
}>()

</script>

<style lang="scss" scoped>
@import '@/assets/style/app.scss';

.pointers {
  display: flex;
  gap: 150px;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    gap: 50px;
  }

  .pointer__info {
    text-align: center;
  }

  .pointer__title {
    color: #211c45;
    font-weight: 700;
    font-size: 20px;
    line-height: 24px;
    margin-bottom: 6px;
  }

  .pointer__data {
    font-size: 16px;
    line-height: 21px;
  }
}

</style>
