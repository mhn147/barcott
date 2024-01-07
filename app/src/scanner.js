import Quagga from "@ericblade/quagga2";

export class QuaggaScanner {
    #config = {
        inputStream: null,
        locator: {
            patchSize: 'medium',
            halfSample: true,
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
            readers: [
                "ean_reader",
                "ean_8_reader",
                {
                    format: "ean_reader",
                    config: {
                        supplements: [
                            'ean_5_reader', 'ean_2_reader'
                        ]
                    }
                },
                "upc_reader",
                "upc_e_reader",
                "code_128_reader",
            ],
        },
        locate: true
    }

    constructor(config, onDetected, onProcessed) {
        if (!config || !config.inputStream) {
            throw Error("Config missing");
        }
        if (!onDetected) {
            throw Error("onDetected missing");
        }

        this.#initConfig(this.#config);

        this.onDetected = onDetected;
        if (onProcessed) this.onProcessed = onProcessed;

        Quagga.init(config);
    }

    #initConfig(config) {
        this.#config.inputStream = config.inputSteam;
        this.#config.locator = config.locator ?? this.#config.locator;
        this.#config.numOfWorkers = config.numOfWorkers ?? this.#config.numOfWorkers;
        this.#config.frequency = config.frequency ?? this.#config.frequency;
        this.#config.decoder = config.decoder ?? this.#config.decoder;
    }

    init() {
        Quagga.init(this.#config, this.#initCallback);
    }

    #initCallback(error) {
        if (error) {
            throw Error(error);
        }
        Quagga.start();
        Quagga.onDetected(this.onDetected);
        Quagga.onProcessed(this.onProcessed);
    }

    start() {
        Quagga.start();
    }

    stop() {
        Quagga.offDetected(this.onDetected);
        Quagga.offProcessed(this.offProcessed);
        Quagga.stop();
    }
}