#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetDataManager, NSObject)

RCT_EXTERN_METHOD(updateWidgetData:(NSArray *)habits
                  tasks:(NSArray *)tasks)

@end 