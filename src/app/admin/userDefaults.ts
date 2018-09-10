import { TestOptionValueType, TestType } from "../exam/data/test-set.api-protocol";

export namespace UserDefaults {

  export namespace EditTestConf {

    export let testType: TestType = TestType.Radio;
    export let testOptionType: TestOptionValueType = TestOptionValueType.Words;

  }

}
