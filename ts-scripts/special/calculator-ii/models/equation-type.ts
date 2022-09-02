export enum CalculatorEquationType {
  no_variable,

  single_linear_variable = 'slv',

  single_variable_to_number_exponent = 'x^n',
  single_number_to_variable_exponent = 'b^x',
  single_variable_to_variable_exponent = 'x^x',

  linear_diophantine_equation = 'lde',
  quadratic = 'quad',

  multi_variate = 'mul',

  miscellaneous = 'mis',
  reject = 'rej'
}
