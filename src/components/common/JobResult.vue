<template>
  <div>
    <span v-if="jobObj.status === 5">The request has been completed successfully.</span>
    <span v-if="jobObj.downloadLink">The output file can be downloaded <a :href="jobObj.downloadLink" target="_blank">here</a>.</span>
  </div>
</template>

<script>
export default {
  name: 'JobResult',
  props: ['jobObj']
};
</script>