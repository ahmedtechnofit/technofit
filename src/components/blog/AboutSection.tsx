'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Code, Dumbbell, Salad, Target, Lightbulb, Users } from 'lucide-react';

const highlights = [
  {
    icon: Code,
    title: 'تطوير المواقع',
    description: 'أبني مواقع ويب حديثة وسريعة باستخدام أحدث التقنيات',
  },
  {
    icon: Dumbbell,
    title: 'كمال الأجسام',
    description: 'خبرة +5 سنوات في التدريب وإعداد البرامج الرياضية',
  },
  {
    icon: Salad,
    title: 'التغذية المتوازنة',
    description: 'خطط غذائية مخصصة تناسب أهدافك الصحية',
  },
  {
    icon: Target,
    title: 'تحليل البيانات',
    description: 'استخدام الذكاء الاصطناعي لتحليل الأداء الرياضي',
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Users className="h-4 w-4" />
              من أنا
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              أهلاً! أنا <span className="text-gradient">أحمد</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              مدرب تقني يجمع بين شغف التكنولوجيا وعالم اللياقة البدنية
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  أؤمن بأن التكنولوجيا يمكن أن تحدث ثورة في طريقة نتدرب ونتغذى بها. 
                  لذلك أسعى لدمج أحدث التقنيات مع الخبرة العملية في مجال اللياقة البدنية.
                </p>
                <p>
                  رحلتي بدأت منذ أكثر من 5 سنوات في مجال كمال الأجسام والتغذية، 
                  وخلال هذه الفترة ساعدت الكثير من العملاء على تحقيق أهدافهم من خلال 
                  خطط تدريبية وغذائية مخصصة.
                </p>
                <p>
                  أيضاً أعمل في مجال تطوير المواقع الإلكترونية، مما يتيح لي بناء 
                  أدوات ومنصات تساعد الرياضيين على تتبع تقدمهم وتحسين أدائهم.
                </p>
              </div>

              {/* Vision */}
              <Card className="border-accent/20 bg-accent/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-accent/20">
                      <Lightbulb className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">رؤيتي</h3>
                      <p className="text-sm text-muted-foreground">
                        بناء مجتمع رياضي ذكي يستفيد من التكنولوجيا والتحليلات 
                        لتحقيق أفضل النتائج بطريقة علمية ومستدامة.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((item, index) => (
                <Card key={index} className="card-hover">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
