
import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {JWTAuthenticationComponent, MyUserService, SECURITY_SCHEME_SPEC} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingKey} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {MiddlewareSequence, RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {RoleAuthorizationInterceptor} from './interceptors/role.interceptor';
import {TokenAuthorizationInterceptor} from './interceptors/token-verification.interceptor';
import {ApiKeyStrategy} from './services/authentication-strategies/api-key.service';
import {JwtService} from './services/authentication-strategies/jwt.service';
import {AuthorizationService} from './services/role-auth.service';
import { Logger } from './logging/logger';
import { LogMiddleware } from './middleware/logging.middleware';
import { MySequence } from './newsequence';
import { corsMiddleware } from './middleware/cors.middleware';
import { TournamentService } from './services/tournament/tournament.service';
import { PgsqldbDataSource } from './datasources';

export {ApplicationConfig};
export const LOGGER_BINDING = BindingKey.create<Logger>('logger');

export class DartzBackendApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
  
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.basePath('/api');
    // Bind the logger
    this.bind(LOGGER_BINDING).toClass(Logger);

    // Set up the custom sequence -> this is required for the explorer ui
    // Breaks CORS when set, so comment out/solve for that.
   this.sequence(MySequence);

    // Register the logging middleware
    //this.middleware(LogMiddleware);
    //this.middleware(corsMiddleware);


    // Setup bindings
    this.setupBindings();        
    // Add security specifications
    this.addSecuritySpec();

    // Setup authentication components
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);

    // Register Custom Authentication Strategy
    registerAuthenticationStrategy(this, ApiKeyStrategy);

    // Set up the default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
      useSelfHostedSpec: true,
      openApiSpecUrl: '/openapi.json',
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

    // Register interceptors
    this.interceptor(TokenAuthorizationInterceptor);
    this.interceptor(RoleAuthorizationInterceptor);
  }

  setupBindings(): void {
    // Services
    this.bind('services.UserService').toClass(MyUserService);
    this.bind('services.JwtService').toClass(JwtService);
    this.bind('services.AuthorizationService').toClass(AuthorizationService);
    //this.bind('services.TournamentService').toClass(TournamentService);

    // Authentication
    this.bind('authentication.apiKey').to(process.env.BACKEND_API_KEY);
    this.bind('authentication.strategies.apiKeyStrategy').toClass(ApiKeyStrategy);


    //this.dataSource(PgsqldbDataSource); // Keeping this breaks data source availibiity in rest of app.
  }

  addSecuritySpec() {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'DartzBackend API',
        version: '1.0.0',
        description: 'DartZ Backend',
        contact: {
          name: 'Seamtech',
          email: 'danseam@outlook.com'
        }
      },
      paths: {},
      components: {
        securitySchemes: SECURITY_SCHEME_SPEC,
      },
      security: [
        {
          jwt: [],
        },
      ],
    });
  }
}
