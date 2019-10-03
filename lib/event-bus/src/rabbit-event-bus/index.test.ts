import RabbitEventBus from '.';
import { Channel, channel } from 'rs-channel-node';
import { StateChange } from './types';
import AMQPConnector from './amqp-connector';
import * as logger from '../logger';
jest.mock('../logger');
jest.mock('./amqp-connector');

describe('AMQP Connection Manager', () => {
  describe('behaviour in a good connection state', () => {
    it('forwards messages to a connector', async () => {
      const publishMock = jest.fn(async () => true);

      // (...as any) needed because jest is magic
      // tslint:disable-next-line
      (AMQPConnector as any).mockImplementation(
        ([send, _]: Channel<StateChange<{}>>) => {
          send({
            newState: 'CONNECTED',
          });
          return {
            publish: publishMock,
            subscribe: jest.fn(),
          };
        },
      );
      const manager = new RabbitEventBus([], '');
      await manager.publish({
        kind: 'test',
        namespace: 'test',
        id: 'soemthing',
        created: new Date(),
        payload: {},
      });

      expect(publishMock).toBeCalled();
    });

    it('passes on subscribes to the connector immediately, while it\'s ready', async () => {
      const subscribeMock = jest.fn();
      const [readyNotify, readyWait] = channel<{}>();
      // (...as any) needed because jest is magic
      // tslint:disable-next-line
      (AMQPConnector as any).mockImplementation(
        ([send, _]: Channel<StateChange<{}>>) => {
          send({
            newState: 'CONNECTED',
          });

          readyNotify({});
          return {
            publish: jest.fn(),
            subscribe: subscribeMock,
          };
        },
      );

      const manager = new RabbitEventBus([], '');

      await manager.subscribe(
        {
          kind: 'test',
          namespace: 'test',
        },
        jest.fn(),
      );

      await readyWait();
      expect(subscribeMock).toBeCalled();
    });

    it('it resolves publishes once they\'ve actually been published', async done => {
      const publishMock = jest.fn();

      // This channel is used to simulate startup delay in the connector
      const [readyNotify, readyWait] = channel<{}>();

      // (...as any) needed because jest is magic
      // tslint:disable-next-line
      (AMQPConnector as any).mockImplementation(
        ([send, _]: Channel<StateChange<{}>>, __, subscriptions) => {
          send({
            newState: 'CONNECTED',
          });
          readyWait().then(() => {
            send({
              newState: 'NOT_CONNECTED',
            });
          });
          return {
            subscriptions,
            publish: publishMock,
            subscribe: jest.fn(),
          };
        },
      );

      const manager = new RabbitEventBus([], '');

      const publishPromise = Promise.all([
        manager.publish({
          kind: 'test',
          namespace: 'test',
          id: 'soemthing',
          created: new Date(),
          payload: {},
        }),
        manager.publish({
          kind: 'test',
          namespace: 'test',
          id: 'soemthing',
          created: new Date(),
          payload: {},
        }),
        manager.publish({
          kind: 'test',
          namespace: 'test',
          id: 'soemthing',
          created: new Date(),
          payload: {},
        }),
      ]);

      expect(publishMock).toBeCalledTimes(0);

      // simulate some startup delay in the connector
      setTimeout(() => {
        readyNotify({});
        // Expect the connector to be created with subscriptions
        expect(publishMock).toBeCalledTimes(3);
        done();
      }, 50);
    });

    it('passes on subscribes that are registered after the connector is ready', async done => {
      const subscribeMock = jest.fn();
      const connectMock = jest.fn();

      // This channel is used to simulate startup delay in the connector
      const [readyNotify, readyWait] = channel<{}>();

      // (...as any) needed because jest is magic
      // tslint:disable-next-line
      (AMQPConnector as any).mockImplementation(
        ([send, _]: Channel<StateChange<{}>>, __, subscriptions) => {
          send({
            newState: 'CONNECTED',
          });
          readyWait().then(() => {
            send({
              newState: 'NOT_CONNECTED',
            });
          });
          return {
            subscriptions,
            connect: connectMock,
            publish: jest.fn(),
            subscribe: subscribeMock,
          };
        },
      );

      const manager = new RabbitEventBus([], '');

      await manager.subscribe(
        {
          kind: 'test',
          namespace: 'test',
        },
        jest.fn(),
      );
      await manager.subscribe(
        {
          kind: 'test',
          namespace: 'test',
        },
        jest.fn(),
      );
      await manager.subscribe(
        {
          kind: 'test',
          namespace: 'test',
        },
        jest.fn(),
      );

      // tslint:disable-next-line
      expect((manager as any).subscriptions.length).toEqual(3);
      expect(subscribeMock).toBeCalledTimes(3);

      // simulate some startup delay in the connector
      setTimeout(() => {
        readyNotify({});
        // Expect the connector to be created with subscriptions
        // tslint:disable-next-line
        expect((manager as any).connector.get().subscriptions.length).toEqual(
          3,
        );
        done();
      }, 50);
    });
  });

  describe('behaviour with a failed connection', () => {});
});