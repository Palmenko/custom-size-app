import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  DataTable,
  Badge,
  Toast,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  try {
    // Получаем статистику
    const measurementsCount = await prisma.measurement.count();
    const activeMeasurementsCount = await prisma.measurement.count({
      where: { active: true }
    });
    const productGroupsCount = await prisma.productGroup.count();
    const activeProductGroupsCount = await prisma.productGroup.count({
      where: { active: true }
    });

    // Получаем последние мерки
    const recentMeasurements = await prisma.measurement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // Получаем последние группы товаров
    const recentProductGroups = await prisma.productGroup.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        groupMeasurements: {
          include: {
            measurement: true
          }
        }
      }
    });

    return json({
      stats: {
        totalMeasurements: measurementsCount,
        activeMeasurements: activeMeasurementsCount,
        totalProductGroups: productGroupsCount,
        activeProductGroups: activeProductGroupsCount
      },
      recentMeasurements,
      recentProductGroups
    });
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    return json({
      stats: {
        totalMeasurements: 0,
        activeMeasurements: 0,
        totalProductGroups: 0,
        activeProductGroups: 0
      },
      recentMeasurements: [],
      recentProductGroups: []
    });
  }
};

export default function Index() {
  const { stats, recentMeasurements, recentProductGroups } = useLoaderData();
  const shopify = useAppBridge();
  const fetcher = useFetcher();

  // Показываем уведомление о результате заполнения базы данных
  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("База данных заполнена тестовыми данными!");
    } else if (fetcher.data?.error) {
      shopify.toast.show("Ошибка при заполнении базы данных");
    }
  }, [fetcher.data, shopify]);

  const handleSeedData = () => {
    fetcher.submit({}, { method: "POST", action: "/api/seed" });
  };

  return (
    <Page>
      <TitleBar title="Панель управления мерками" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Добро пожаловать в приложение Custom Size! 🎉
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Управляйте мерками для ваших товаров и создавайте группы товаров для автоматического отображения форм с мерками.
                  </Text>
                </BlockStack>
                
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Статистика
                  </Text>
                  <InlineStack gap="400">
                    <Card>
                      <BlockStack gap="200">
                        <Text variant="headingLg" as="h4">
                          {stats.totalMeasurements}
                        </Text>
                        <Text variant="bodySm" as="p">
                          Всего мерок
                        </Text>
                        <Badge tone={stats.activeMeasurements > 0 ? "success" : "warning"}>
                          {stats.activeMeasurements} активных
                        </Badge>
                      </BlockStack>
                    </Card>
                    
                    <Card>
                      <BlockStack gap="200">
                        <Text variant="headingLg" as="h4">
                          {stats.totalProductGroups}
                        </Text>
                        <Text variant="bodySm" as="p">
                          Групп товаров
                        </Text>
                        <Badge tone={stats.activeProductGroups > 0 ? "success" : "warning"}>
                          {stats.activeProductGroups} активных
                        </Badge>
                      </BlockStack>
                    </Card>
                  </InlineStack>
                </BlockStack>

                {/* Кнопка для заполнения тестовыми данными */}
                {stats.totalMeasurements === 0 && (
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h3" variant="headingMd">
                        🚀 Быстрый старт
                      </Text>
                      <Text variant="bodyMd" as="p">
                        База данных пуста. Добавьте тестовые мерки и группы товаров для начала работы.
                      </Text>
                      <Button
                        primary
                        onClick={handleSeedData}
                        loading={fetcher.state === "submitting"}
                      >
                        Добавить тестовые данные
                      </Button>
                    </BlockStack>
                  </Card>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Быстрые действия
                  </Text>
                  <BlockStack gap="200">
                    <Button
                      url="/app/measurements"
                      variant="primary"
                      fullWidth
                    >
                      Управление мерками
                    </Button>
                    <Button
                      url="/app/product-groups"
                      variant="primary"
                      fullWidth
                    >
                      Группы товаров
                    </Button>
                    <Button
                      url="/app/settings"
                      variant="plain"
                      fullWidth
                    >
                      Настройки
                    </Button>
                  </BlockStack>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Последние мерки
                  </Text>
                  {recentMeasurements.length > 0 ? (
                    <List>
                      {recentMeasurements.map((measurement) => (
                        <List.Item key={measurement.id}>
                          {measurement.name}
                          <Badge tone={measurement.active ? "success" : "warning"}>
                            {measurement.active ? "Активна" : "Неактивна"}
                          </Badge>
                        </List.Item>
                      ))}
                    </List>
                  ) : (
                    <Text variant="bodyMd" as="p" tone="subdued">
                      Мерки не найдены
                    </Text>
                  )}
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Последние группы товаров
                  </Text>
                  {recentProductGroups.length > 0 ? (
                    <List>
                      {recentProductGroups.map((group) => (
                        <List.Item key={group.id}>
                          {group.name}
                          <Text variant="bodySm" as="span" tone="subdued">
                            ({group.groupMeasurements.length} мерок)
                          </Text>
                        </List.Item>
                      ))}
                    </List>
                  ) : (
                    <Text variant="bodyMd" as="p" tone="subdued">
                      Группы товаров не найдены
                    </Text>
                  )}
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
