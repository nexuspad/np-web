<template>
  <div>
    <h2>auto completion widgets</h2>
    <label-input />
    <add-user-input />
  </div>
</template>

<script>
import LabelInput from './LabelInput';
import AddUserInput from '../common/AddUserInput';

export default {
  name: 'AutoCompletion',
  components: { LabelInput, AddUserInput }
}
</script>

<style>

</style>
