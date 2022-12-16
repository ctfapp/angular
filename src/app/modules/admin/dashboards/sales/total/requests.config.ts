import { httpConfig } from "app/mock-api/common/http/config";

// should be minified
export const Runtimefields = {"runtime_mappings":{"Empresa":{"type":"keyword","script":{"source":"emit(doc['tenant'].value);"}},"Actividade":{"type":"keyword","script":{"source":"emit(doc['activity'].value);"}},"TipoArtigoServicoNome":{"type":"keyword","script":{"source":"def type  = doc['TipoArtigoServico'].value;\r\nif(type == 'A'){\r\nemit('Artigo')\r\n}\r\nelse {\r\nemit('Serviço')\r\n}"}}}};

export const Requests = {
    "totalSales": {
        "aggs": {
            "1": {
                "sum": {
                    "field": "ValorLiquidoVendaEUR"
                }
            }
        },
        "size": 0,
        "fields": [{
            "field": "created_date_time",
            "format": "strict_date_time"
        }, {
            "field": "date",
            "format": "date_time"
        }
        ],
        "script_fields": {},
        "stored_fields": [
            "*"
        ],
        "runtime_mappings": Runtimefields.runtime_mappings,
        "_source": {
            "excludes": []
        },
        "query": {
            "bool": {
                "must": [],
                "filter": [{
                    "match_phrase": {
                        "resource_type": "vendas"
                    }
                }, {
                    "range": {
                        "date": {
                            "format": "strict_date_optional_time",
                            "gte": httpConfig.dateTime.gte,
                            "lte": httpConfig.dateTime.lte,
                        }
                    }
                }
                ],
                "should": [],
                "must_not": []
            }
        }
    },
    "variationSales":{
        "aggs": {
        "time_offset_split": {
          "filters": {
            "filters": {
              "0": {
                "range": {
                  "date": {
                    "format": "strict_date_optional_time",
                    "gte": httpConfig.dateTime.gte,
                    "lte": httpConfig.dateTime.lte
                  }
                }
              },
              "7839251085": {
                "range": {
                  "date": {
                    "format": "strict_date_optional_time",
                    "gte": httpConfig.dateTime.gte,
                    "lte": httpConfig.dateTime.gte,
                  }
                }
              }
            }
          },
          "aggs": {
            "0": {
              "sum": {
                "field": "ValorLiquidoVendaEUR"
              }
            },
            "1": {
              "sum": {
                "field": "ValorLiquidoVendaEUR"
              }
            }
          }
        }
        },
        "size": 0,
        "fields": [
        {
          "field": "created_date_time",
          "format": "strict_date_time"
        },
        {
          "field": "date",
          "format": "date_time"
        }
        ],
        "script_fields": {},
        "stored_fields": [
        "*"
        ],
        "runtime_mappings": Runtimefields.runtime_mappings,
        "_source": {
        "excludes": []
        },
        "query": {
        "bool": {
          "must": [],
          "filter": [
            {
              "match_phrase": {
                "resource_type": "vendas"
              }
            },
            {
              "bool": {
                "should": [
                  {
                    "bool": {
                      "filter": [
                        {
                          "range": {
                            "date": {
                              "format": "strict_date_optional_time",
                              "gte": httpConfig.dateTime.gte,
                              "lte": httpConfig.dateTime.lte,
                            }
                          }
                        }
                      ]
                    }
                  },
                  {
                    "bool": {
                      "filter": [
                        {
                          "range": {
                            "date": {
                              "format": "strict_date_optional_time",
                              "gte": httpConfig.dateTime.gte,
                              "lte": httpConfig.dateTime.lte,
                            }
                          }
                        }
                      ]
                    }
                  }
                ],
                "minimum_should_match": 1
              }
            }
          ],
          "should": [],
          "must_not": []
        }
        }
    },
    "monthlySales":{
      "aggs": {
        "0": {
          "date_histogram": {
            "field": "date",
            "calendar_interval": "1M",
            "time_zone": "Europe/Lisbon"
          },
          "aggs": {
            "1": {
              "sum": {
                "field": "ValorLiquidoVendaEUR"
              }
            }
          }
        }
      },
      "size": 0,
      "fields": [
        {
          "field": "created_date_time",
          "format": "strict_date_time"
        },
        {
          "field": "date",
          "format": "date_time"
        }
      ],
      "script_fields": {},
      "stored_fields": [
        "*"
      ],
      "_source": {
        "excludes": []
      },
      "query": {
        "bool": {
          "must": [],
          "filter": [
            {
              "match_phrase": {
                "resource_type": "vendas"
              }
            },
            {
              "range": {
                "date": {
                  "format": "strict_date_optional_time",
                  "gte": httpConfig.dateTime.gte,
                  "lte": httpConfig.dateTime.gte
                }
              }
            }
          ],
          "should": [],
          "must_not": []
        }
      }
    },
    "byCompanyActivity":{
      "aggs": {
      "0": {
        "terms": {
        "field": "activity",
        "order": {
          "2": "desc"
        },
        "size": 30
        },
        "aggs": {
        "1": {
          "terms": {
          "field": "NomeEmpresa",
          "order": {
            "2": "desc"
          },
          "size": 30
          },
          "aggs": {
          "2": {
            "sum": {
            "field": "ValorLiquidoVendaEUR"
            }
          }
          }
        },
        "2": {
          "sum": {
          "field": "ValorLiquidoVendaEUR"
          }
        }
        }
      }
      },
      "size": 0,
      "fields": [
      {
        "field": "created_date_time",
        "format": "strict_date_time"
      },
      {
        "field": "date",
        "format": "date_time"
      }
      ],
      "script_fields": {},
      "stored_fields": [
      "*"
      ],
      "runtime_mappings": Runtimefields.runtime_mappings,
      "_source": {
      "excludes": []
      },
      "query": {
      "bool": {
        "must": [],
        "filter": [
        {
          "match_phrase": {
          "resource_type": "vendas"
          }
        },
        {
          "range": {
          "date": {
            "format": "strict_date_optional_time",
            "gte": "2022-05-19T23:00:00.000Z",
            "lte": "2022-08-18T10:10:29.130Z"
          }
          }
        }
        ],
        "should": [],
        "must_not": []
      }
      }
    },
    "byGroupNotGroupMonth":{
      "aggs": {
        "0": {
          "terms": {
            "field": "VendasGrupo",
            "order": {
              "_key": "asc"
            },
            "size": 3
          },
          "aggs": {
            "1": {
              "date_histogram": {
                "field": "date",
                "calendar_interval": "1M",
                "time_zone": "Europe/Lisbon"
              },
              "aggs": {
                "2": {
                  "sum": {
                    "field": "ValorLiquidoVendaEUR"
                  }
                }
              }
            }
          }
        }
      },
      "size": 0,
      "fields": [
        {
          "field": "created_date_time",
          "format": "strict_date_time"
        },
        {
          "field": "date",
          "format": "date_time"
        }
      ],
      "runtime_mappings": {
        "Empresa": {
          "type": "keyword",
          "script": {
            "source": "emit(doc['tenant'].value);"
          }
        },
      "Actividade": {
          "type": "keyword",
          "script": {
            "source": "emit(doc['activity'].value);"
          }
        }
      },
      "_source": {
        "excludes": []
      },
      "query": {
        "bool": {
          "must": [],
          "filter": [
            {
              "match_phrase": {
                "resource_type": "vendas"
              }
            },
            {
              "range": {
                "date": {
                  "format": "strict_date_optional_time",
                  "gte": "2022-05-23T23:00:00.000Z",
                  "lte": "2022-08-22T09:19:58.334Z"
                }
              }
            }
          ],
          "should": [],
          "must_not": []
        }
      }
    },
    "byProductServiceMonth":{
      "aggs": {
        "0": {
          "terms": {
            "field": "TipoArtigoServicoNome",
            "order": {
              "_key": "asc"
            },
            "size": 3
          },
          "aggs": {
            "1": {
              "date_histogram": {
                "field": "date",
                "calendar_interval": "1M",
                "time_zone": "Europe/Lisbon"
              },
              "aggs": {
                "2": {
                  "sum": {
                    "field": "ValorLiquidoVendaEUR"
                  }
                }
              }
            }
          }
        }
      },
      "size": 0,
      "fields": [
        {
          "field": "created_date_time",
          "format": "strict_date_time"
        },
        {
          "field": "date",
          "format": "date_time"
        }
      ],
      "runtime_mappings": {
        "Empresa": {
          "type": "keyword",
          "script": {
            "source": "emit(doc['tenant'].value);"
          }
        },
      "Actividade": {
          "type": "keyword",
          "script": {
            "source": "emit(doc['activity'].value);"
          }
        },
        "TipoArtigoServicoNome": {
          "type": "keyword",
          "script": {
            "source": "def type  = doc['TipoArtigoServico'].value;\r\nif(type == 'A'){\r\nemit('Artigo')\r\n}\r\nelse {\r\nemit('Servico')\r\n}"
          }
        }
      },
      "_source": {
        "excludes": []
      },
      "query": {
        "bool": {
          "must": [],
          "filter": [
            {
              "match_phrase": {
                "resource_type": "vendas"
              }
            },
            {
              "range": {
                "date": {
                  "format": "strict_date_optional_time",
                  "gte": "2022-05-23T23:00:00.000Z",
                  "lte": "2022-08-22T09:19:58.334Z"
                }
              }
            }
          ],
          "should": [],
          "must_not": []
        }
      }
    },
    "byMarketMonth":{
      "aggs": {
        "0": {
          "terms": {
            "field": "TipoMercado",
            "order": {
              "_key": "asc"
            },
            "size": 3
          },
          "aggs": {
            "1": {
              "date_histogram": {
                "field": "date",
                "calendar_interval": "1M",
                "time_zone": "Europe/Lisbon"
              },
              "aggs": {
                "2": {
                  "sum": {
                    "field": "ValorLiquidoVendaEUR"
                  }
                }
              }
            }
          }
        }
      },
      "size": 0,
      "fields": [
        {
          "field": "created_date_time",
          "format": "strict_date_time"
        },
        {
          "field": "date",
          "format": "date_time"
        }
      ],
      "script_fields": {},
      "stored_fields": [
        "*"
      ],
      "runtime_mappings": {
        "Empresa": {
          "type": "keyword",
          "script": {
            "source": "emit(doc['tenant'].value);"
          }
        },
      "Actividade": {
          "type": "keyword",
          "script": {
            "source": "emit(doc['activity'].value);"
          }
        }},
      "_source": {
        "excludes": []
      },
      "query": {
        "bool": {
          "must": [],
          "filter": [
            {
              "match_phrase": {
                "resource_type": "vendas"
              }
            },
            {
              "range": {
                "date": {
                  "format": "strict_date_optional_time",
                  "gte": "2022-05-23T23:00:00.000Z",
                  "lte": "2022-08-22T14:58:25.334Z"
                }
              }
            }
          ],
          "should": [],
          "must_not": []
        }
      }
    }
};

// should be minified
export const RequestsArr = [
{"totalSales":{"aggs":{"1":{"sum":{"field":"ValorLiquidoVendaEUR"}}},"size":0,"fields":[{"field":"created_date_time","format":"strict_date_time"},{"field":"date","format":"date_time"}],"script_fields":{},"stored_fields":["*"],"runtime_mappings":Runtimefields.runtime_mappings,"_source":{"excludes":[]},"query":{"bool":{"must":[],"filter":[{"match_phrase":{"resource_type":"vendas"}},{"range":{"date":{"format":"strict_date_optional_time","gte":httpConfig.dateTime.gte,"lte":httpConfig.dateTime.lte,}}}],"should":[],"must_not":[]}}}},{"variationSales":{"aggs":{"time_offset_split":{"filters":{"filters":{"0":{"range":{"date":{"format":"strict_date_optional_time","gte":httpConfig.dateTime.gte,"lte":httpConfig.dateTime.lte}}},"7839251085":{"range":{"date":{"format":"strict_date_optional_time","gte":httpConfig.dateTime.gte,"lte":httpConfig.dateTime.gte,}}}}},"aggs":{"0":{"sum":{"field":"ValorLiquidoVendaEUR"}},"1":{"sum":{"field":"ValorLiquidoVendaEUR"}}}}},"size":0,"fields":[{"field":"created_date_time","format":"strict_date_time"},{"field":"date","format":"date_time"}],"script_fields":{},"stored_fields":["*"],"runtime_mappings":Runtimefields.runtime_mappings,"_source":{"excludes":[]},"query":{"bool":{"must":[],"filter":[{"match_phrase":{"resource_type":"vendas"}},{"bool":{"should":[{"bool":{"filter":[{"range":{"date":{"format":"strict_date_optional_time","gte":httpConfig.dateTime.gte,"lte":httpConfig.dateTime.lte,}}}]}},{"bool":{"filter":[{"range":{"date":{"format":"strict_date_optional_time","gte":httpConfig.dateTime.gte,"lte":httpConfig.dateTime.lte,}}}]}}],"minimum_should_match":1}}],"should":[],"must_not":[]}}}},{"monthlySales":{"aggs":{"0":{"date_histogram":{"field":"date","calendar_interval":"1M","time_zone":"Europe/Lisbon"},"aggs":{"1":{"sum":{"field":"ValorLiquidoVendaEUR"}}}}},"size":0,"fields":[{"field":"created_date_time","format":"strict_date_time"},{"field":"date","format":"date_time"}],"script_fields":{},"stored_fields":["*"],"_source":{"excludes":[]},"query":{"bool":{"must":[],"filter":[{"match_phrase":{"resource_type":"vendas"}},{"range":{"date":{"format":"strict_date_optional_time","gte":httpConfig.dateTime.gte,"lte":httpConfig.dateTime.gte}}}],"should":[],"must_not":[]}}}},{"byCompanyActivity":{"aggs":{"0":{"terms":{"field":"activity","order":{"2":"desc"},"size":30},"aggs":{"1":{"terms":{"field":"NomeEmpresa","order":{"2":"desc"},"size":30},"aggs":{"2":{"sum":{"field":"ValorLiquidoVendaEUR"}}}},"2":{"sum":{"field":"ValorLiquidoVendaEUR"}}}}},"size":0,"fields":[{"field":"created_date_time","format":"strict_date_time"},{"field":"date","format":"date_time"}],"script_fields":{},"stored_fields":["*"],"runtime_mappings":Runtimefields.runtime_mappings,"_source":{"excludes":[]},"query":{"bool":{"must":[],"filter":[{"match_phrase":{"resource_type":"vendas"}},{"range":{"date":{"format":"strict_date_optional_time","gte":"2022-05-19T23:00:00.000Z","lte":"2022-08-18T10:10:29.130Z"}}}],"should":[],"must_not":[]}}}},{"byGroupNotGroupMonth":{"aggs":{"0":{"terms":{"field":"VendasGrupo","order":{"_key":"asc"},"size":3},"aggs":{"1":{"date_histogram":{"field":"date","calendar_interval":"1M","time_zone":"Europe/Lisbon"},"aggs":{"2":{"sum":{"field":"ValorLiquidoVendaEUR"}}}}}}},"size":0,"fields":[{"field":"created_date_time","format":"strict_date_time"},{"field":"date","format":"date_time"}],"runtime_mappings":{"Empresa":{"type":"keyword","script":{"source":"emit(doc['tenant'].value);"}},"Actividade":{"type":"keyword","script":{"source":"emit(doc['activity'].value);"}}},"_source":{"excludes":[]},"query":{"bool":{"must":[],"filter":[{"match_phrase":{"resource_type":"vendas"}},{"range":{"date":{"format":"strict_date_optional_time","gte":"2022-05-23T23:00:00.000Z","lte":"2022-08-22T09:19:58.334Z"}}}],"should":[],"must_not":[]}}}},{"byProductServiceMonth":{"aggs":{"0":{"terms":{"field":"TipoArtigoServicoNome","order":{"_key":"asc"},"size":3},"aggs":{"1":{"date_histogram":{"field":"date","calendar_interval":"1M","time_zone":"Europe/Lisbon"},"aggs":{"2":{"sum":{"field":"ValorLiquidoVendaEUR"}}}}}}},"size":0,"fields":[{"field":"created_date_time","format":"strict_date_time"},{"field":"date","format":"date_time"}],"runtime_mappings":{"Empresa":{"type":"keyword","script":{"source":"emit(doc['tenant'].value);"}},"Actividade":{"type":"keyword","script":{"source":"emit(doc['activity'].value);"}},"TipoArtigoServicoNome":{"type":"keyword","script":{"source":"def type  = doc['TipoArtigoServico'].value;\r\nif(type == 'A'){\r\nemit('Artigo')\r\n}\r\nelse {\r\nemit('Servico')\r\n}"}}},"_source":{"excludes":[]},"query":{"bool":{"must":[],"filter":[{"match_phrase":{"resource_type":"vendas"}},{"range":{"date":{"format":"strict_date_optional_time","gte":"2022-05-23T23:00:00.000Z","lte":"2022-08-22T09:19:58.334Z"}}}],"should":[],"must_not":[]}}}},{"byMarketMonth":{"aggs":{"0":{"terms":{"field":"TipoMercado","order":{"_key":"asc"},"size":3},"aggs":{"1":{"date_histogram":{"field":"date","calendar_interval":"1M","time_zone":"Europe/Lisbon"},"aggs":{"2":{"sum":{"field":"ValorLiquidoVendaEUR"}}}}}}},"size":0,"fields":[{"field":"created_date_time","format":"strict_date_time"},{"field":"date","format":"date_time"}],"script_fields":{},"stored_fields":["*"],"runtime_mappings":{"Empresa":{"type":"keyword","script":{"source":"emit(doc['tenant'].value);"}},"Actividade":{"type":"keyword","script":{"source":"emit(doc['activity'].value);"}}},"_source":{"excludes":[]},"query":{"bool":{"must":[],"filter":[{"match_phrase":{"resource_type":"vendas"}},{"range":{"date":{"format":"strict_date_optional_time","gte":"2022-05-23T23:00:00.000Z","lte":"2022-08-22T14:58:25.334Z"}}}],"should":[],"must_not":[]}}}}
];