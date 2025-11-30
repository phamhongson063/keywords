// Practice View Component - Uses Vue component instead of vanilla JS
const Practice = {
  props: {
    mode: {
      type: String,
      default: 'vocabulary'
    }
  },
  components: {
    PracticeComponent
  },
  template: `<PracticeComponent :mode="mode" />`
};

