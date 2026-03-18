FROM ballerina/ballerina:2201.13.1 AS builder
WORKDIR /app
COPY . .
RUN bal build

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/bin/backend.jar .
COPY resources/ resources/
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["java", "-jar", "backend.jar"]
