
import detectFocus from './detect-focus';
import memorizeResult from './memorize-result';

// form[tabindex=0][disabled] should be focusable as the
// specification doesn't know the disabled attribute on the form element
// @specification http://www.w3.org/TR/html5/forms.html#the-form-element
export default memorizeResult(() => detectFocus({
  name: 'can-focus-disabled-form',
  element: 'form',
  mutate: function(element) {
    element.setAttribute('tabindex', 0);
    element.setAttribute('disabled', 'disabled');
  },
}));
