import Image from "next/image";

export default function DosierPrintPage() {
    return (
        <main className="dosier-print bg-white text-zinc-900">
            <section className="page cover">
                <div className="cover-bg">
                    <Image
                        src="/images/Rodada 1.jpg"
                        alt="Rodada L.A.M.A. Medellin"
                        fill
                        priority
                        className="object-cover"
                    />
                </div>
                <div className="cover-overlay" />
                <div className="content">
                    <p className="eyebrow">Dossier Comercial 2026</p>
                    <h1>Tu marca rodara con 26 naciones</h1>
                    <p className="lead">
                        L.A.M.A. Bike Fest Sabaneta 2026 presenta una oportunidad de alto impacto para
                        marcas que buscan visibilidad premium, afinidad real y conversion comercial.
                    </p>
                </div>
            </section>

            <section className="page">
                <div className="content">
                    <p className="eyebrow">Resumen Ejecutivo</p>
                    <h2>Por que Sabaneta 2026</h2>
                    <p>
                        Sabaneta se convierte en el epicentro del motociclismo continental. Con delegaciones
                        de 26 paises, el festival es punto de encuentro de lideres de opinion, viajeros de
                        larga distancia y empresarios del sector motor.
                    </p>
                    <div className="grid two mt-lg">
                        <article className="card">
                            <h3>+26</h3>
                            <p>Naciones confirmadas</p>
                        </article>
                        <article className="card">
                            <h3>0</h3>
                            <p>Incidentes reportados</p>
                        </article>
                        <article className="card">
                            <h3>+500K</h3>
                            <p>Impresiones digitales</p>
                        </article>
                        <article className="card">
                            <h3>3</h3>
                            <p>Zonas de visibilidad premium</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="page">
                <div className="content">
                    <p className="eyebrow">Planes de Patrocinio</p>
                    <h2>Escalamiento por impacto de marca</h2>
                    <div className="grid three mt-lg">
                        <article className="plan">
                            <h3>Plata</h3>
                            <p className="price">$1.5M COP</p>
                            <ul>
                                <li>Logo M (Base)</li>
                                <li>Punto de activacion</li>
                                <li>1 post en redes</li>
                                <li>Menciones en tarima</li>
                            </ul>
                        </article>
                        <article className="plan">
                            <h3>Oro</h3>
                            <p className="price">$3M COP</p>
                            <ul>
                                <li>Logo L (Central)</li>
                                <li>Stand estandar</li>
                                <li>2 posts en redes</li>
                                <li>Presencia en Tarima y La Molienda</li>
                            </ul>
                        </article>
                        <article className="plan featured">
                            <h3>Diamante</h3>
                            <p className="price">$5.5M COP</p>
                            <ul>
                                <li>Logo XL (Superior)</li>
                                <li>Stand VIP</li>
                                <li>Home + 4 posts</li>
                                <li>Presencia total en festival</li>
                                <li>Branding en Fiestas del Platano</li>
                            </ul>
                        </article>
                    </div>
                </div>
            </section>

            <section className="page">
                <div className="content">
                    <p className="eyebrow">Mesa Fraterna</p>
                    <h2>Patrocinio de impacto emocional</h2>
                    <p className="price big">$850.000 COP</p>
                    <p>
                        Apadrina 10 almuerzos de alto nivel y posiciona tu marca en el momento mas humano
                        del festival. El 100% del aporte va directo a la alimentacion de delegaciones.
                    </p>
                    <div className="note mt-md">
                        <p>Incluye branding en individuales y mencion de honor en clausura.</p>
                    </div>
                </div>
            </section>

            <section className="page">
                <div className="content">
                    <p className="eyebrow">Vinculacion Flexible</p>
                    <h2>Modelos adaptados a cada patrocinador</h2>
                    <div className="grid two mt-lg">
                        <article className="card">
                            <h3>Donaciones en especie</h3>
                            <p>Souvenirs, herramientas, accesorios y tecnologia para kits oficiales.</p>
                        </article>
                        <article className="card">
                            <h3>Experiencias de marca</h3>
                            <p>Activaciones en vivo y rifas especiales en La Molienda.</p>
                        </article>
                        <article className="card">
                            <h3>Aportes de capital</h3>
                            <p>Fortalecimiento operativo y fondo de participacion masiva.</p>
                        </article>
                        <article className="card">
                            <h3>Bandera oficial</h3>
                            <p>Presencia en tablados, lobby hotel sede y escenario principal.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="page">
                <div className="content">
                    <p className="eyebrow">Caso de Exito</p>
                    <h2>Gestion El Salvador 2026</h2>
                    <div className="grid two mt-lg">
                        <article className="card">
                            <h3>24+</h3>
                            <p>Naciones participantes</p>
                        </article>
                        <article className="card">
                            <h3>100%</h3>
                            <p>Satisfaccion de patrocinadores</p>
                        </article>
                        <article className="card">
                            <h3>0</h3>
                            <p>Incidentes reportados</p>
                        </article>
                        <article className="card">
                            <h3>+500K</h3>
                            <p>Impresiones digitales</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="page closing">
                <div className="content">
                    <p className="eyebrow">Contacto Directo</p>
                    <h2>Daniel Andrey Villamizar Araque</h2>
                    <p>Presidente Capitulo L.A.M.A. Medellin</p>
                    <p>Presidente Region Norte - L.A.M.A. Colombia</p>
                    <p className="mt-md"><strong>Telefono:</strong> +57 310 632 8171</p>
                    <p><strong>Email:</strong> gerencia@fundacionlamamedellin.org</p>
                    <p className="mt-lg small">L.A.M.A. Bike Fest Sabaneta 2026 - Dossier Comercial</p>
                </div>
            </section>

            <style jsx global>{`
                @page {
                    size: Letter;
                    margin: 10mm;
                }

                .dosier-print {
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    color: #1a1a1a;
                }

                .page {
                    position: relative;
                    min-height: 252mm;
                    break-after: page;
                    page-break-after: always;
                    display: flex;
                    align-items: stretch;
                }

                .page:last-of-type {
                    break-after: auto;
                    page-break-after: auto;
                }

                .content {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    padding: 10mm;
                }

                .cover {
                    color: #ffffff;
                    overflow: hidden;
                }

                .cover-bg {
                    position: absolute;
                    inset: 0;
                }

                .cover-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.35));
                    z-index: 1;
                }

                .eyebrow {
                    text-transform: uppercase;
                    letter-spacing: 0.14em;
                    font-size: 11px;
                    font-weight: 700;
                    margin: 0 0 10px 0;
                    color: #d97706;
                }

                .cover .eyebrow {
                    color: #fde68a;
                }

                h1 {
                    margin: 0;
                    font-size: 46px;
                    line-height: 1.05;
                    max-width: 800px;
                }

                h2 {
                    margin: 0 0 12px 0;
                    font-size: 34px;
                    line-height: 1.12;
                }

                h3 {
                    margin: 0 0 6px 0;
                    font-size: 24px;
                    line-height: 1.15;
                }

                p {
                    margin: 0;
                    font-size: 15px;
                    line-height: 1.5;
                    max-width: 860px;
                }

                ul {
                    margin: 8px 0 0 0;
                    padding-left: 18px;
                }

                li {
                    margin: 0 0 5px 0;
                    font-size: 14px;
                    line-height: 1.35;
                }

                .lead {
                    margin-top: 18px;
                    font-size: 20px;
                    line-height: 1.35;
                    max-width: 760px;
                }

                .grid {
                    display: grid;
                    gap: 7mm;
                }

                .grid.two {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }

                .grid.three {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }

                .card,
                .plan,
                .note {
                    border: 1px solid #d4d4d8;
                    border-radius: 12px;
                    padding: 12px;
                    break-inside: avoid-page;
                    page-break-inside: avoid;
                }

                .plan.featured {
                    border-color: #d97706;
                    background: #fffbeb;
                }

                .price {
                    font-weight: 700;
                    font-size: 20px;
                    margin-bottom: 6px;
                    color: #b45309;
                }

                .price.big {
                    font-size: 34px;
                    margin: 4px 0 10px 0;
                }

                .closing {
                    background: #fafafa;
                }

                .small {
                    font-size: 12px;
                    color: #52525b;
                }

                .mt-md {
                    margin-top: 10px;
                }

                .mt-lg {
                    margin-top: 16px;
                }

                @media screen {
                    body {
                        background: #e4e4e7;
                    }

                    .dosier-print {
                        max-width: 216mm;
                        margin: 20px auto;
                        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
                    }
                }

                @media print {
                    html,
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </main>
    );
}
