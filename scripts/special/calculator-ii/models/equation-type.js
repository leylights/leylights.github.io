export var CalculatorEquationType;
(function (CalculatorEquationType) {
    CalculatorEquationType[CalculatorEquationType["no_variable"] = 0] = "no_variable";
    CalculatorEquationType["single_linear_variable"] = "slv";
    CalculatorEquationType["single_variable_to_number_exponent"] = "x^n";
    CalculatorEquationType["single_number_to_variable_exponent"] = "b^x";
    CalculatorEquationType["single_variable_to_variable_exponent"] = "x^x";
    CalculatorEquationType["linear_diophantine_equation"] = "lde";
    CalculatorEquationType["quadratic"] = "quad";
    CalculatorEquationType["single_variable_polynomial"] = "poly";
    CalculatorEquationType["multi_variate"] = "mul";
    CalculatorEquationType["miscellaneous"] = "mis";
    CalculatorEquationType["reject"] = "rej";
})(CalculatorEquationType || (CalculatorEquationType = {}));
//# sourceMappingURL=equation-type.js.map