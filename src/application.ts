import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  MyUserService,
  SECURITY_SCHEME_SPEC,
} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingKey} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {RoleAuthorizationInterceptor} from './interceptors/role.interceptor';
import {TokenAuthorizationInterceptor} from './interceptors/token-verification.interceptor';
import {Logger} from './logging/logger';
import {MySequence} from './newsequence';
import {ApiKeyStrategy} from './services/authentication-strategies/api-key.service';
import {JwtService} from './services/authentication-strategies/jwt.service';
import {RedisService} from './services/redis.service';
import {AuthorizationService} from './services/role-auth.service';

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
    // Need to figure out how to add the data sources properly, or if it's even required.
    // Take a second look at custom sequence - Currently, replacing the default
    // sequence causes multiple issues with CORS etc.
    // this.dataSource(RedisCacheDataSource);
    //this.dataSource(RedisQueueDataSource);
    // this.dataSource(PgsqldbDataSource);

    // Bind repositories
    // this.repository(CacheRepository);
    // this.repository(QueueRepository);
    //  this.repository(PgsqldbDataSource);
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
    this.bind('authentication.strategies.apiKeyStrategy').toClass(
      ApiKeyStrategy,
    );
    this.bind('services.RedisService').toClass(RedisService);
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
          email: 'danseam@outlook.com',
        },
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
