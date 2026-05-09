<script lang="ts">
  import { GDatepicker } from './lib';

  let value1 = '05/21/2222';
  let value2 = '2014/3/21 - 2014/3/28';
  let value3 = '21/05/1985';
</script>

<div class="min-h-screen bg-white py-8 text-[#555]">
  <div class="mx-auto w-[600px] max-w-full px-4 font-[Arial,Helvetica,sans-serif]">
    <h2 class="mb-6 text-2xl font-semibold">Date Picker example</h2>

    <h3 class="mb-3 text-lg font-semibold">EN (us-english - default) <br /> Single. Default.</h3>
    <GDatepicker bind:value={value1} language="en" />
    <hr class="my-5 border-0 bg-[#ccc] h-px" />

    <h3 class="mb-3 text-lg font-semibold">ZH-CN (chinese) <br /> Single, Header Format Option</h3>
    <GDatepicker
      bind:value={value2}
      language="zh-cn"
      headerDayFormat="ddd"
      theme="purple"
      selectRange={30}
      format="L"
      formatOutput="L"
    />
    <hr class="my-5 border-0 bg-[#ccc] h-px" />

    <h3 class="mb-3 text-lg font-semibold">EN-GB (gb-english) <br /> Single, Format Output Option.</h3>
    <GDatepicker bind:value={value3} language="en-gb" formatOutput="L" selectRange={30} theme="midnight" />
  </div>
</div>
