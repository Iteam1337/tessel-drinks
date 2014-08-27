var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));

describe('Camera', function () {

  var camera, modulelib, module;

  beforeEach(function () {
    module = {
      takePicture: sinon.stub()
    };
    modulelib = {
      use: sinon.stub().returns(module)
    };
    camera = proxyquire(process.cwd() + '/lib/camera', {
      'camera-vc0706': modulelib
    });

    sinon.stub(process, 'nextTick').yields();
  });
  afterEach(function () {
    process.nextTick.restore();
  });

  it('uses the supplied port', function () {
    camera('B');
    expect(modulelib.use).calledWith('B').calledOnce;
  });

  it('returns a camera service', function () {
    expect(camera('B').takePicture).to.be.a('function');
  });

  describe('#takePicture', function () {

    it('calls takePicture on the camera module', function () {
      camera('A').takePicture();
      expect(module.takePicture).calledOnce;
    });

    it('resolves the promise on success', function () {
      var success = sinon.spy(),
        fail = sinon.spy();

      camera('D').takePicture().then(success).catch(fail);
      var pic = {};
      module.takePicture.yield(null, pic);
      expect(fail).not.called;
      expect(success).calledOnce.calledWith(pic);
    });

    it('rejects the promise on fail', function () {
      var success = sinon.spy(),
        fail = sinon.spy();

      camera('D').takePicture().then(success).catch(fail);
      var err = {};
      module.takePicture.yield(err);
      expect(fail).calledOnce.calledWith(err);
      expect(success).not.called;
    });

  });
});