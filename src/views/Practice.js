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
