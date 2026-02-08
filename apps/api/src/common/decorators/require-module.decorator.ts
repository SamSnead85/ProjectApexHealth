import { SetMetadata } from '@nestjs/common';

export const MODULE_KEY = 'required_module';
export const RequireModule = (moduleId: string) => SetMetadata(MODULE_KEY, moduleId);
