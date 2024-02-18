<template>
  <div class="puzzle">
    <Pointers :coverage="coveragePercent" :speed="clearSpeed" />
    <div id="dots">
      <img
        v-if="hiddenImageSize && isPuzzleSet"
        :style="{ width: '100%', maxWidth: hiddenImageSize + 'px', maxHeight: hiddenImageSize + 'px' }"
        class="puzzle__initial" :src="image" alt="секретная картинка"
      >
      <div v-if="isPuzzleSet && isDescriptionVisible" class="puzzle__description">
        <span class="puzzle__desktop">Проведи курсором<br>по области</span>
        <span class="puzzle__mobile">Проведи пальцем по <br>экрану</span>
        <span>Раскрой картинку на&nbsp;100%</span>
      </div>
    </div>
    <div
      v-show='!isPuzzleSet && spinnerWidth'
      :style="{ width: spinnerWidth + 'px', height: spinnerWidth + 'px', position: 'relative' }"
    >
      <BaseSpinner :is-loading="true"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue';
import Puzzle from '@/lib/Puzzle.ts';
import { Nullable } from '@/types.ts';

import Pointers from '@/components/Pointers.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';

const puzzleInstance = ref<Nullable<Puzzle>>(null);
const hiddenImageSize = ref<Nullable<number>>(null);
const isPuzzleSet = ref<boolean>(false);
const isDescriptionVisible = ref<boolean>(true);
const spinnerWidth = ref<number>(0);

const hideDescription = () => {
  isDescriptionVisible.value = false;
}

const props = defineProps<{ image: string }>()

const coveragePercent = computed(() => {
  if (!puzzleInstance.value) return 0;
  return puzzleInstance.value.getCoverage();
})

const clearSpeed = computed(() => {
  if (!puzzleInstance.value) return 0;
  return puzzleInstance.value.getClearSpeed();
})

onMounted(() => {
  if (!Puzzle.isCanvasSupported()) {
    alert('Canvas недоступен');
    return;
  }

  if (!Puzzle.isSVGSupported()) {
    alert('SVG недоступен');
    return;
  }

  const MAX_SIZE = Puzzle.getMaxImageSize();
  const MIN_FRACTION_SIZE = 2;
  spinnerWidth.value = MAX_SIZE;

  puzzleInstance.value = new Puzzle(MAX_SIZE, MIN_FRACTION_SIZE, props.image, '#dots');
  // window.puzzle = puzzleInstance.value;

  try {
    puzzleInstance.value.loadImage();
    const image = new Image();
    image.onload = (event) => {
      if (!puzzleInstance.value) return;
      const loadedImage = event.currentTarget as HTMLImageElement;
      puzzleInstance.value.getColorMatrix(loadedImage);
      puzzleInstance.value.setPixels();
      isPuzzleSet.value = true;
    };
    image.src = puzzleInstance.value.getImagePath() || '';

    hiddenImageSize.value = MAX_SIZE > 512 ? MAX_SIZE :
      MAX_SIZE % 2 === 0 ?
        MAX_SIZE : MAX_SIZE - 5;

    //@ts-ignore
    window.puzzle = puzzleInstance.value;

  } catch (error) {
    throw new Error(String(error))
  }
})

const emit = defineEmits(['success']);

watch(() => puzzleInstance?.value?.isComplete, (newValue) => {
  if (!newValue) return;
  emit('success')
})

watch(() => puzzleInstance?.value?.wasPuzzleInteracted, (newValue) => {
  if (!newValue) return;
  hideDescription();
})

</script>

<style lang="scss">
 @import '@/assets/style/app.scss';

.puzzle {
  display: flex;
  align-items: center;
  flex-direction: column;

  svg {
    filter: drop-shadow(1px 1px 2px #0000005e);
    z-index: 3;
  }

  rect.hidden {
    animation: hidePixel .4s ease-in-out forwards;
  }

  &__initial {
    display: block;
    user-select: none;
    width: 100%;
    height: auto;
    position: absolute;
    z-index: 1;
  }

  #dots {
    display: inline-flex;
    position: relative;
  }

  &__desktop {
    display: block;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__mobile {
    display: none;

    @media (max-width: 768px) {
      display: block;
    }
  }

  &__description {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 5;
    max-width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    justify-content: center;
    width: 100%;
    padding: 20px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    span {
      color: #FFFFFF;
      font-size: 30px;
      font-weight: 600;
      line-height: 33px;
    }

    img {
      margin: 31px 0;
      width: 43px;
    }

    @media (max-width: 400px) or (max-height: 550px) {
      span {
        font-size: 20px;
        font-weight: 600;
        line-height: 24px;
      }

      img {
        margin: 15px 0;
        width: 20px;
      }
    }
  }

  #dots {
    overflow: hidden;
  }
}

@keyframes hidePixel {
  50% {
    width: 0;
  }

  100% {
    height: 0;
    width: 0;
  }
}
</style>
