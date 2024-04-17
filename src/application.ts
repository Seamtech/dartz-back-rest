import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import path from 'path';
import { MySequence } from './sequence';
import { AuthenticationComponent } from '@loopback/authentication';
import { JWTAuthenticationComponent, MyUserService, SECURITY_SCHEME_SPEC } from '@loopback/authentication-jwt';
import { JwtService } from './services/authentication-strategies/jwt.service'
import { RoleAuthorizationInterceptor } from './interceptors/role.interceptor';
import { TokenAuthorizationInterceptor } from './interceptors/token-verification.interceptor';
import { AuthorizationService } from './services/role-auth.service';
//import { ApiKeyStrategy } from './services/authentication-strategies/api-key.service';

export { ApplicationConfig };

export class DartzBackendApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);


    // setup bindings
    this.setupBindings();

    // Add security specifications
    this.addSecuritySpec();

    // Setup authentication components
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);

    // Register Custom Authentication Strategy (uncomment if you have a custom strategy)
    // registerAuthenticationStrategy(this, ApiKeyStrategy);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },

    };
  }

  setupBindings(): void {
    //Classes
    this.bind('services.UserService').toClass(MyUserService);
    this.bind('services.JwtService').toClass(JwtService);
    this.bind('services.AuthorizationService').toClass(AuthorizationService);
    //Interceptors
    this.bind('interceptors.RoleAuthorizationInterceptor').toProvider(RoleAuthorizationInterceptor);
    this.bind('interceptors.TokenAuthorizationInterceptor').toProvider(TokenAuthorizationInterceptor);
    //this.bind('authentication.apiKey').to(process.env.BACKEND_API_KEY);
    // this.bind('authentication.strategies.apiKeyStrategy').toClass(ApiKeyStrategy);
  }

  addSecuritySpec() {
    this.api({
      openapi: '3.0.0',
      // ... other spec details
      components: {
        securitySchemes: SECURITY_SCHEME_SPEC
      },
      // Define global security requirement
      info: {
        title: 'My Awesome API',
        version: '1.0.0',
        description: 'This API does amazing things.',
        termsOfService: 'http://onlinedartz.com/terms/',
        contact: {
          name: 'API Support',
          url: 'http://www.onlinedartz.com/support',
          email: 'support@example.com',
        },
        license: {
          name: '',
          url: '',
        },
      },
      paths: {},
    });
  }
}
