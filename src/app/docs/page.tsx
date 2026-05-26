"use client";

import SwaggerUI from "swagger-ui-react";
import { Container, Title } from "@mantine/core";
import "swagger-ui-react/swagger-ui.css";

export default function DocsPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="lg">
        API Documentation
      </Title>
      <SwaggerUI url="/api/docs" docExpansion="list" defaultModelsExpandDepth={1} />
    </Container>
  );
}
