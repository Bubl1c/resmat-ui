var ResmatConfig = (function () {

  var APPConfig;
  let apiHost;
  var GoogleAnalyticsConfig;

  if (ResmatEnvironment === "local") {
    APPConfig = {
      productionHostname: "localhost",
      title: "Resmat",
      topBarHeader: "Програмний коплекс дистанційного навчання",
      icon: "../img/favicon.ico",
      consent: "Користуючись системою Ви поогоджуєтесть на збір та обробку Вашої персональної інформації та дій в рамках системи"
    };
    apiHost = "localhost";
    GoogleAnalyticsConfig = {
      trackingId: undefined
    };
  }

  if (ResmatEnvironment === "knuca") {
    APPConfig = {
      productionHostname: "sopromat-knuba.com",
      title: "Опір матеріалів. КНУБА.",
      topBarHeader: "Програмний коплекс дистанційного навчання кафедри опору матеріалів",
      icon: "../img/knuba_logo.gif",
      consent: "Користуючись системою Ви поогоджуєтесть на збір та обробку Вашої персональної інформації та дій в рамках системи викладачами КНУБА"
    };
    apiHost = "ec2-52-57-195-49.eu-central-1.compute.amazonaws.com";
    GoogleAnalyticsConfig = {
      trackingId: "UA-125813714-1"
    };
  }

  if (ResmatEnvironment === "zmi") {
    APPConfig = {
      productionHostname: "zhim-test.com",
      title: "ЖМІ Дистанційно",
      topBarHeader: "Програмний коплекс дистанційного навчання Житомирського Медичного Інституту",
      icon: "../img/zmi/zmi_logo_small.png",
      consent: "Користуючись системою Ви поогоджуєтесть на збір та обробку Вашої персональної інформації та дій в рамках системи викладачами ЖМІ"
    };
    apiHost = "resmat-zmi-public-1015820515.eu-central-1.elb.amazonaws.com";
    GoogleAnalyticsConfig = {
      trackingId: "UA-163987372-1"
    };
  }

  return {
    env: ResmatEnvironment,
    app: APPConfig,
    api: {
      host: apiHost,
      port: 9000,
      version: "v1"
    },
    googleAnalytics: GoogleAnalyticsConfig
  }
})();
