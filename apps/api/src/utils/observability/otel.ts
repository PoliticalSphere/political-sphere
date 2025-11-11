import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';

export const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
      ? { url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT }
      : {}
  ),
  instrumentations: [getNodeAutoInstrumentations()],
});
