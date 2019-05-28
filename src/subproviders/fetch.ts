import { AuthenticatedFetchSubprovider } from 'bitski-provider';
import { Agent } from 'https';

export class NodeFetchSubprovider extends AuthenticatedFetchSubprovider {

  protected generateParameters(payload: any, accessToken?: string): any {
    const parameters: any = super.generateParameters(payload, accessToken);

    // Bitski's servers require TLS 1.2 or greater
    const agent = new Agent({
      secureProtocol: 'TLSv1_2_method',
    });

    parameters.agent = agent;

    return parameters;
  }

}
