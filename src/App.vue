<template>
  <header class="header">
    <img class="header-logo" :src="amigaImage" alt="amiga logo">
  </header>
  <PuzzleImage :image="testImage" />
</template>

<script setup lang="ts">
import testImage from '@/assets/parrita.jpg';
import amigaImage from '@/assets/svg/amiga-logo.svg?url';
import PuzzleImage from '@/components/Puzzle.vue';

</script>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  background-color: #211c45;
  margin-bottom: 24px;

  &-logo {
    display: block;
    width: 100%;
    height: 30px;
  }
}

</style>
