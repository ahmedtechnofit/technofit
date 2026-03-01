'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Code, Dumbbell, Salad, BarChart3, Check, ArrowLeft,
  Globe, Smartphone, Database, Zap
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Dumbbell,
  Salad,
  BarChart3,
  Globe,
  Smartphone,
  Database,
  Zap,
};

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string;
  price?: string;
}

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.services && data.services.length > 0) {
        setServices(data.services);
      } else {
        // Use default services if none exist
        setServices(defaultServices);
      }
    } catch {
      setServices(defaultServices);
    } finally {
      setLoading(false);
    }
  };

  const defaultServices: Service[] = [
    {
      id: '1',
      title: 'تطوير المواقع',
      description: 'أبني مواقع ويب احترافية وسريعة الاستجابة تناسب نشاطك',
      icon: 'Globe',
      features: JSON.stringify([
        'تصميم عصري ومتجاوب',
        'تحسين محركات البحث (SEO)',
        'سرعة تحميل فائقة',
        'دعم فني مستمر',
      ]),
    },
    {
      id: '2',
      title: 'استشارات التغذية',
      description: 'استشارات شخصية لتحسين نظامك الغذائي وتحقيق أهدافك',
      icon: 'Salad',
      features: JSON.stringify([
        'تحليل احتياجاتك الغذائية',
        'نصائح مخصصة',
        'متابعة دورية',
        'تعديل الخطة حسب التقدم',
      ]),
    },
    {
      id: '3',
      title: 'خطط غذائية مخصصة',
      description: 'خطط غذائية متكاملة تناسب هدفك (زيادة/نزول/تثبيت الوزن)',
      icon: 'Dumbbell',
      features: JSON.stringify([
        'حساب السعرات والماكرو',
        'وجبات متنوعة ولذيذة',
        'قوائم تسوق أسبوعية',
        'وصفات سهلة التحضير',
      ]),
    },
    {
      id: '4',
      title: 'تحليل الأداء الرياضي',
      description: 'استخدام البيانات والتحليلات لتحسين أدائك الرياضي',
      icon: 'BarChart3',
      features: JSON.stringify([
        'تتبع التقدم الدقيق',
        'تحليل نقاط القوة والضعف',
        'توصيات مبنية على البيانات',
        'تقارير مفصلة',
      ]),
    },
  ];

  if (loading) {
    return (
      <section id="services" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-pulse">جاري التحميل...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              الخدمات
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              كيف يمكنني <span className="text-gradient">مساعدتك</span>؟
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              أقدم مجموعة متنوعة من الخدمات التي تجمع بين التكنولوجيا واللياقة والتغذية
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Code;
              const features = JSON.parse(service.features || '[]');
              
              return (
                <Card key={service.id || index} className="card-hover overflow-hidden group">
                  <CardHeader className="pb-4">
                    <div className="p-3 rounded-xl tech-gradient w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-accent" />
                          </div>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full group/btn">
                      <a href="https://wa.me/201069465855" target="_blank" rel="noopener noreferrer">
                        تواصل للتفاصيل
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover/btn:-translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Card className="inline-block border-accent/20 bg-accent/5">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  هل تحتاج خدمة مخصصة؟ تواصل معي لمناقشة احتياجاتك
                </p>
                <Button asChild className="fitness-gradient text-primary-foreground">
                  <a href="https://wa.me/201069465855" target="_blank" rel="noopener noreferrer">
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    تواصل عبر واتساب
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
