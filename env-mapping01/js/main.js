//無名関数で全体を囲んで外部から参照されないようにする。
(() => {
    //ページが読み込まれたとき
    window.addEventListener('load', () => {
        initStats();
        init();
        render();
    });

    //リサイズした時
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    var textureLoader = null;
    var texture = null;
    var scene = null;
    var renderer = null;
    var camera = null;
    var bgGeo = null;
    var bgMaterial = null;
    var bgMesh = null;
    var cubeCamera01 = null;
    var cubeCamera02 = null;
    var sphereGeo01 = null;
    var refractionMaterial = null;
    var sphereMesh01 = null;
    var sphereGeo02 = null;
    var reflectivityMaterial = null;
    var sphereMesh02 = null;
    var stats = null;
    var orbitcontrols = null;
    // var controls = null;
    // var gui = null;
    // var step = .04;

    //初期化処理
    function init() {

        // controls = new function () {
        //     this.rotationspeed = .02;
        //     this.boundspeed = .03;
        // }

        // gui = new dat.GUI();
        // gui.add(controls, 'rotationspeed', 0, .5);
        // gui.add(controls, 'boundspeed', 0, .5);

        textureLoader = new THREE.TextureLoader();
        texture = textureLoader.load('../images/img.jpg');
        // texture.mapping = THREE.UVMapping;

        //シーンを作成
        scene = new THREE.Scene();

        //カメラを作成
        camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            1000,
        );
        camera.position.set(-30, 40, 30);
        camera.lookAt(scene.position);

        //レンダラーを作成
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(new THREE.Color(0xEEEEEE)); //背景色を指定
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        wrapper = document.querySelector('#webgl');
        wrapper.appendChild(renderer.domElement);

        // 軸ヘルパーの作成
        axesHelper = new THREE.AxesHelper(10.0);
        scene.add(axesHelper);

        //背景の作成
        bgGeo = new THREE.SphereGeometry(500, 32, 16);
        bgMaterial = new THREE.MeshBasicMaterial({ map: texture });
        bgMesh = new THREE.Mesh(bgGeo, bgMaterial);
        scene.add(bgMesh);

        //球体の映り込みの準備
        //cubeCameraで環境マッピングを作成
        cubeCamera01 = new THREE.CubeCamera(1, 1000, 256);
        cubeCamera01.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
        scene.add(cubeCamera01);

        cubeCamera02 = new THREE.CubeCamera(1, 1000, 256);
        cubeCamera02.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
        // scene.add(cubeCamera02);

        //cubeCameraに屈折マッピングを適用
        cubeCamera01.renderTarget.mapping = THREE.CubeRefractionMapping; //屈折マッピングを適用
        refractionMaterial = new THREE.MeshBasicMaterial({
            color: 0xf0f0ff,
            envMap: cubeCamera01.renderTarget, //屈折マッピングにしたcubeCameraで作成した環境マッピングを適用
            refractionRatio: 0.75, //屈折率
        });

        //cubeCameraに反射マッピングを適用
        reflectivityMaterial = new THREE.MeshBasicMaterial({
            color: 0xcccccc,
            envMap: cubeCamera02.renderTarget, //屈折マッピングのcubeCameraで作成した環境マッピングを適用
            refractionRatio: 0.75, //屈折率
            reflectivity: 1, //反射率
            opacity: 0.3, //不透明度で反射具合を調整
            transparent: true //透明を有効に
        });

        //球体に屈折マッピングと反射マッピングを適用
        sphereGeo01 = new THREE.IcosahedronGeometry(20, 3);
        sphereMesh01 = new THREE.Mesh(sphereGeo01, refractionMaterial);
        scene.add(sphereMesh01);

        sphereGeo02 = new THREE.IcosahedronGeometry(20, 3);
        sphereMesh02 = new THREE.Mesh(sphereGeo02, reflectivityMaterial);
        // scene.add(sphereMesh02);

        //ライトの追加
        // var spotLight = new THREE.SpotLight(0xffffff);
        // spotLight.position.set(-20, 30, -5);
        // spotLight.castShadow = true;
        // scene.add(spotLight);

        // コントロール
        orbitcontrols = new THREE.OrbitControls(camera, renderer.domElement);
    }

    function initStats() {
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.right = '0px';
        stats.domElement.style.pointerEvents = 'none';
        document.getElementById('stats').appendChild(stats.domElement);
        return stats;
    }

    function render() {
        stats.update();

        refractionMaterial.envMap = cubeCamera01.renderTarget;
        cubeCamera01.updateCubeMap(renderer, scene);
        // reflectivityMaterial.envMap = cubeCamera02.renderTarget.texture;
        // cubeCamera02.updateCubeMap(renderer, scene);
        sphereMesh01.visible = true;
        // sphereMesh02.visible = true;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
})();